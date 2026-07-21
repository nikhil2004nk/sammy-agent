import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { WorkspacesService } from '../workspaces.service';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private workspacesService: WorkspacesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.headers['x-workspace-id'];

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!workspaceId) {
      throw new BadRequestException('x-workspace-id header is required');
    }

    // Verify membership
    await this.workspacesService.validateMembership(workspaceId as string, user.userId);
    
    // Attach workspaceId to request for convenience in downstream controllers
    request.workspaceId = workspaceId;

    return true;
  }
}
