import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
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

  @Delete('jobs/:jobId')
  async disableJob(@Param('jobId') jobId: string) {
    await this.schedulerService.disable(jobId);
    return { success: true };
  }
}
