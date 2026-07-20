import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../../common/execution-context';
import { PlannerService } from '../planner/planner.service';
import { PromptBuilderService } from '../../prompts/prompt-builder.service';
import { LlmFactoryService } from '../../llm/factory/llm-factory.service';
import { EventBusService } from '../../events/event-bus.service';
import { ToolExecutorService } from '../../tools/tool-executor.service';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    private readonly planner: PlannerService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly llmFactory: LlmFactoryService,
    private readonly eventBus: EventBusService,
    private readonly toolExecutor: ToolExecutorService,
  ) {}

  /**
   * The core Agent Runtime ReAct loop.
   */
  async executeTurn(context: ExecutionContext, userInput: string): Promise<string> {
    this.eventBus.emitExecutionStarted(context.traceId, context.agentId, context.conversationId);
    this.logger.log(`Starting execution turn for traceId: ${context.traceId}`);

    const plan = await this.planner.createPlan(context);
    let finalResponse = '';

    for (const step of plan) {
      if (step.action === 'react_loop') {
        const MAX_ITERATIONS = 5;
        let iteration = 0;
        let isDone = false;

        context.toolResults = [];

        while (!isDone && iteration < MAX_ITERATIONS) {
          iteration++;
          this.logger.debug(`ReAct Loop Iteration ${iteration}`);

          const messages = await this.promptBuilder.buildPrompt(context, userInput);
          const llmProvider = this.llmFactory.getProvider(context.modelConfig.provider);
          
          const response = await llmProvider.generateResponse(
            messages,
            context.modelConfig.temperature,
            context.modelConfig.maxTokens
          );

          // Mocking LLM parsing for Tool calls vs Final Answer
          // In a real scenario, this relies on tool_calls in LLM response
          if (response.content.includes('<call_tool>')) {
            // Mock extraction
            const toolNameMatch = response.content.match(/<call_tool>(.*?)<\/call_tool>/);
            const toolName = toolNameMatch ? toolNameMatch[1] : 'unknown';
            
            this.eventBus.emitToolCalled(context.traceId, context.agentId, context.conversationId, toolName, {});
            const toolResult = await this.toolExecutor.executeTool(toolName, {});
            this.eventBus.emitToolFinished(context.traceId, context.agentId, context.conversationId, toolName, toolResult);
            
            context.toolResults.push({ toolName, result: toolResult });
          } else {
            // No tool called, we have our final answer
            finalResponse = response.content;
            isDone = true;
          }
        }
      }
    }

    this.logger.log(`Finished execution turn for traceId: ${context.traceId}`);
    this.eventBus.emitExecutionFinished(context.traceId, context.agentId, context.conversationId, finalResponse);
    return finalResponse;
  }
}
