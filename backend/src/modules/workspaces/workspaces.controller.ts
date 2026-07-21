import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get()
  async getWorkspaces(@CurrentUser() user: any) {
    return this.workspacesService.getUserWorkspaces(user.userId);
  }

  @Get('current')
  async getCurrentWorkspace(@CurrentUser() user: any) {
    const workspaces = await this.workspacesService.getUserWorkspaces(user.userId);
    return workspaces.length > 0 ? workspaces[0] : null;
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workspacesService.getWorkspaceMembers(id, user.userId);
  }
}
