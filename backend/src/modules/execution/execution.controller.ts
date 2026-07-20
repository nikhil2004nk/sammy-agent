import { Controller, Get, Param } from '@nestjs/common';
import { ExecutionTrackerService } from './execution-tracker.service';

@Controller()
export class ExecutionController {
  constructor(private readonly executionTracker: ExecutionTrackerService) {}

  @Get('conversations/:conversationId/runs')
  async getRuns(@Param('conversationId') conversationId: string) {
    return this.executionTracker.getRunsForConversation(conversationId);
  }

  @Get('runs/:runId')
  async getRunDetails(@Param('runId') runId: string) {
    return this.executionTracker.getRunWithNodes(runId);
  }
}
