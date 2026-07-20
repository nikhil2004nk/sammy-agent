import { Injectable } from '@nestjs/common';
import { ILLMMessage, ILLMTool } from '../llm/interfaces/llm-provider.interface';
import { Message } from '../conversation/conversation.types';
import { ToolMetadata } from '../mcp/types/mcp.types';

@Injectable()
export class PromptBuilderService {
  /**
   * Transforms the conversation messages and capabilities into the format required by the LLM.
   */
  buildPrompt(messages: Message[], capabilities: ToolMetadata[]): { messages: ILLMMessage[], tools: ILLMTool[] } {
    const llmMessages: ILLMMessage[] = messages.map(msg => this.mapMessage(msg));
    const tools: ILLMTool[] = capabilities.map(cap => this.mapCapabilityToTool(cap));
    return { messages: llmMessages, tools };
  }

  private mapMessage(msg: Message): ILLMMessage {
    switch (msg.role) {
      case 'user':
        return { role: 'user', content: msg.content };
      case 'system':
        return { role: 'system', content: msg.content };
      case 'assistant':
        return {
          role: 'assistant',
          content: msg.content,
          toolCalls: msg.toolCalls?.map(tc => ({
            id: tc.id,
            name: tc.name,
            arguments: tc.arguments
          }))
        };
      case 'tool':
        return {
          role: 'tool',
          content: typeof msg.result === 'string' ? msg.result : JSON.stringify(msg.result),
          toolCallId: msg.toolCallId,
          name: msg.toolName
        };
      default:
        throw new Error(`Unsupported message role`);
    }
  }

  private mapCapabilityToTool(cap: ToolMetadata): ILLMTool {
    return {
      name: cap.name,
      description: cap.description || `Tool ${cap.name}`,
      inputSchema: cap.inputSchema || { type: 'object', properties: {} }
    };
  }
}
