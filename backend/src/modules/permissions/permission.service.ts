import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../common/execution-context';
import { ToolMetadata } from '../mcp/types/mcp.types';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  async checkToolPermission(context: ExecutionContext, tool: ToolMetadata): Promise<boolean> {
    // In Phase 2, this is a stub.
    // In a real system, you would check if context.agentId or context.tenantId 
    // has permission to execute this tool based on tool.permissions or RBAC.
    this.logger.debug(`Checking permissions for tool '${tool.name}' (Agent: ${context.agentId})`);
    
    return true; // Always allow for now
  }
}
