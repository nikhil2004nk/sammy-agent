import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../../common/execution-context';
import { ToolMetadata } from '../../mcp/types/mcp.types';

export class ApprovalRequiredException extends Error {
  constructor(public readonly toolName: string, public readonly approvalId: string) {
    super(`Tool '${toolName}' requires human approval.`);
    this.name = 'ApprovalRequiredException';
  }
}

@Injectable()
export class ApprovalMiddleware {
  private readonly logger = new Logger(ApprovalMiddleware.name);

  async validate(context: ExecutionContext, toolMetadata: ToolMetadata, args: Record<string, any>): Promise<void> {
    if (!toolMetadata.requiresApproval) {
      return; // No approval required, proceed
    }

    this.logger.debug(`Tool '${toolMetadata.name}' requires approval. Checking context...`);

    // In a real implementation, we would check if context contains an approval token or id for this tool call.
    // For Phase 2, we stub it by checking a mock property in metadata.
    const isApproved = context.metadata?.approvedToolCalls?.includes(toolMetadata.name);

    if (!isApproved) {
      const approvalId = require('crypto').randomUUID();
      this.logger.warn(`Approval required for tool '${toolMetadata.name}'. Suspending execution.`);
      
      // In a real system, we'd emit an event or save the pending approval to the DB here.
      
      throw new ApprovalRequiredException(toolMetadata.name, approvalId);
    }

    this.logger.log(`Tool '${toolMetadata.name}' is approved for execution.`);
  }
}
