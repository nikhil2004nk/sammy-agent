import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { ScheduledJobConfig } from './scheduler.types';

@Controller('workspaces/:workspaceId/scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get('jobs')
  async listJobs(@Param('workspaceId') workspaceId: string) {
    return this.schedulerService.listForWorkspace(workspaceId);
  }

  @Post('jobs')
  async createJob(
    @Param('workspaceId') workspaceId: string,
    @Body() body: Omit<ScheduledJobConfig, 'workspaceId'>
  ) {
    const jobId = await this.schedulerService.create({ ...body, workspaceId });
    return { id: jobId, message: 'Scheduled job created' };
  }

  @Patch('jobs/:jobId')
  async updateJob(
    @Param('workspaceId') workspaceId: string,
    @Param('jobId') jobId: string,
    @Body() body: { status?: 'ENABLE' | 'DISABLE' } // and other job config updates
  ) {
    if (body.status === 'DISABLE') {
      await this.schedulerService.disable(jobId);
    } else if (body.status === 'ENABLE') {
      // Logic to enable would go here
    }
    return { success: true, message: 'Job updated' };
  }
}
