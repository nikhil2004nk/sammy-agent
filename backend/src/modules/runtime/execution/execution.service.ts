import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../../common/execution-context';
import { PlannerService } from '../planner/planner.service';
import { PromptBuilderService } from '../../prompts/prompt-builder.service';
import { LlmFactoryService } from '../../llm/factory/llm-factory.service';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    private readonly planner: PlannerService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly llmFactory: LlmFactoryService,
  ) {}

  /**
   * The core Agent Runtime loop.
   */
  async executeTurn(context: ExecutionContext, userInput: string): Promise<string> {
    this.logger.log(`Starting execution turn for traceId: ${context.traceId}`);

    // 1. Planner decides what to do
    const plan = await this.planner.createPlan(context);
    this.logger.debug(`Plan created with ${plan.length} steps`);

    let finalResponse = '';

    // 2. Execution Loop
    for (const step of plan) {
      switch (step.action) {
        case 'call_llm':
          // Build the prompt array
          const messages = await this.promptBuilder.buildPrompt(context, userInput);
          
          // Get the right provider based on ExecutionContext config
          const llmProvider = this.llmFactory.getProvider(context.modelConfig.provider);
          
          // Call LLM
          const response = await llmProvider.generateResponse(
            messages,
            context.modelConfig.temperature,
            context.modelConfig.maxTokens
          );
          
          finalResponse = response.content;
          break;

        case 'execute_tool':
          // Future phase: Call ToolExecutorService
          break;

        case 'respond':
          // Break loop and return
          break;
      }
    }

    this.logger.log(`Finished execution turn for traceId: ${context.traceId}`);
    return finalResponse;
  }
}
