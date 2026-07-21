import { Injectable } from '@nestjs/common';
import { ILLMMessage, ILLMTool } from '../llm/interfaces/llm-provider.interface';
import { Message } from '../conversation/conversation.types';
import { ToolMetadata } from '../mcp/types/mcp.types';

const SYSTEM_PROMPT = `You are Sammy, an intelligent AI agent built on the Sammy Agent Platform.

## Identity
- Your name is Sammy.
- You are helpful, concise, and professional.
- You were created to assist users with a wide range of tasks.

## Capabilities
- You can reason through complex problems step by step.
- When tools are available, you use them to retrieve real information rather than guessing.
- You always tell the user clearly when you don't know something or when a task is beyond your current capabilities.

## Behavior Rules
- Always respond in the same language the user writes in.
- Never claim to be a different AI (e.g., ChatGPT, Claude, Gemini).
- Keep responses clear and well-structured. Use markdown when it aids readability.
- If a user asks who you are, tell them you are Sammy.`;

@Injectable()
export class PromptBuilderService {
  /**
   * Transforms the conversation messages and capabilities into the format required by the LLM.
   * Always injects the system identity prompt as the very first message.
   */
  buildPrompt(messages: Message[], capabilities: ToolMetadata[]): { messages: ILLMMessage[], tools: ILLMTool[] } {
    // Strip any pre-existing system messages from history to avoid duplication
    const nonSystemMessages = messages.filter((m: any) => m.role !== 'system');

    const systemMessage: ILLMMessage = { role: 'system', content: SYSTEM_PROMPT };
    const llmMessages: ILLMMessage[] = [systemMessage, ...nonSystemMessages.map(msg => this.mapMessage(msg))];
    const tools: ILLMTool[] = capabilities.map(cap => this.mapCapabilityToTool(cap));
    return { messages: llmMessages, tools };
  }

  private mapMessage(msg: Message | any): ILLMMessage {
    const textContent = msg.parts
      ? msg.parts.map((p: any) => p.type === 'text' ? p.content : '').join('\n')
      : (msg.content || '');

    switch (msg.role?.toLowerCase()) {
      case 'user':
        return { role: 'user', content: textContent };
      case 'system':
        return { role: 'system', content: textContent };
      case 'assistant':
        return {
          role: 'assistant',
          content: textContent,
          toolCalls: msg.toolCalls?.map((tc: any) => ({
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
        throw new Error(`Unsupported message role: ${msg.role}`);
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
