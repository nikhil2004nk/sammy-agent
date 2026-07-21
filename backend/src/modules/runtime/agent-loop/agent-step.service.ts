import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AgentAction } from './agent.types';
import { ExecutionContext } from '../../../common/execution-context';
import { Message } from '../../conversation/conversation.types';
import { PromptBuilderService } from '../../prompts/prompt-builder.service';
import { LlmFactoryService } from '../../llm/factory/llm-factory.service';
import { ToolDiscoveryService } from '../../registry/tool-discovery.service';
import { ExecutionStreamService } from '../../execution/execution-stream.service';

@Injectable()
export class AgentStepService {
  private readonly logger = new Logger(AgentStepService.name);

  constructor(
    private readonly promptBuilder: PromptBuilderService,
    private readonly llmFactory: LlmFactoryService,
    private readonly discovery: ToolDiscoveryService,
    private readonly stream: ExecutionStreamService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Performs exactly one reasoning step.
   * Input: Conversation context
   * Output: AgentAction (ToolCall, Respond, Finish, etc.)
   */
  async executeStep(context: ExecutionContext, messages: Message[]): Promise<AgentAction> {
    // 1. Get available capabilities for this user
    // We pass empty query to get all capabilities for now
    const tools = await this.discovery.getAvailableTools(context);

    // 2. Build LLM Prompt
    const { messages: llmMessages, tools: llmTools } = this.promptBuilder.buildPrompt(messages, tools);

    // Prompt Statistics
    const memoryItemsCount = (context.memoryContext || '').split('\n').filter(l => l.trim().startsWith('-')).length;
    const estimatedTokens = Math.round(JSON.stringify(llmMessages).length / 4 + JSON.stringify(llmTools).length / 4);

    this.logger.log(`
[Prompt Statistics]
Conversation Messages  ${messages.length}
Memory Items           ${memoryItemsCount}
System Prompt          Yes
Estimated Tokens       ~${estimatedTokens}
    `);

    // 3. Invoke LLM
    const defaultProvider = this.configService.get<string>('llm.provider') || 'openai';
    const provider = this.llmFactory.getProvider(context.modelConfig?.provider || defaultProvider);
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
      this.logger.log(`
[Planner Decision]
Selected Tools  ${response.toolCalls.map(t => t.name).join(', ')}
      `);
      return {
        type: 'tool_call',
        toolCalls: response.toolCalls,
        usage: response.usage
      } as any;
    }

    this.logger.log(`
[Tools]
Selected Tools  None
    `);

    if (response.content) {
      this.logger.log(`[Run ${context.runId}] [Planner] LLM decided to respond: "${response.content.replace(/\n/g, ' ')}"`);
      
      this.stream.publish(context.runId, 'message.completed', {
        content: response.content
      });

      return {
        type: 'finish',
        content: response.content,
        usage: response.usage
      } as any;
    }

    // Fallback if the LLM returned nothing useful
    return {
      type: 'cancel',
      reason: 'LLM returned empty response without tool calls.'
    };
  }
}
