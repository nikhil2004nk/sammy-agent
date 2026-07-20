import { Injectable, Logger } from '@nestjs/common';
import { AgentAction } from './agent.types';
import { ExecutionContext } from '../../../common/execution-context';
import { Message } from '../../conversation/conversation.types';
import { PromptBuilderService } from '../../prompts/prompt-builder.service';
import { LlmFactoryService } from '../../llm/factory/llm-factory.service';
import { CapabilityResolverService } from '../../resolver/capability-resolver.service';
import { ExecutionStreamService } from '../../execution/execution-stream.service';

@Injectable()
export class AgentStepService {
  private readonly logger = new Logger(AgentStepService.name);

  constructor(
    private readonly promptBuilder: PromptBuilderService,
    private readonly llmFactory: LlmFactoryService,
    private readonly capabilityResolver: CapabilityResolverService,
    private readonly stream: ExecutionStreamService,
  ) {}

  /**
   * Performs exactly one reasoning step.
   * Input: Conversation context
   * Output: AgentAction (ToolCall, Respond, Finish, etc.)
   */
  async executeStep(context: ExecutionContext, messages: Message[]): Promise<AgentAction> {
    // 1. Get available capabilities for this user
    // We pass empty query to get all capabilities for now
    const capabilities = await this.capabilityResolver.getAvailableTools(context);

    // 2. Build LLM Prompt
    const { messages: llmMessages, tools: llmTools } = this.promptBuilder.buildPrompt(messages, capabilities);

    // 3. Invoke LLM
    const provider = this.llmFactory.getProvider(context.modelConfig?.provider || 'mock');
    const response = await provider.generateResponse(
      llmMessages, 
      context.modelConfig?.temperature || 0, 
      context.modelConfig?.maxTokens || 1000,
      llmTools,
      (delta) => {
        this.stream.publish(context.runId, 'message.delta', {
          delta,
        });
      }
    );

    // 4. Determine Action
    if (response.toolCalls && response.toolCalls.length > 0) {
      this.logger.debug(`LLM decided to call tools: ${response.toolCalls.map(t => t.name).join(', ')}`);
      return {
        type: 'tool_call',
        toolCalls: response.toolCalls
      };
    }

    if (response.content) {
      this.logger.debug(`LLM decided to respond: ${response.content.substring(0, 50)}...`);
      
      this.stream.publish(context.runId, 'message.completed', {
        content: response.content
      });

      return {
        type: 'finish',
        content: response.content
      };
    }

    // Fallback if the LLM returned nothing useful
    return {
      type: 'cancel',
      reason: 'LLM returned empty response without tool calls.'
    };
  }
}
