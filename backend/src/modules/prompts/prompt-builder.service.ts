import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '../../common/execution-context';
import { ILLMMessage } from '../llm/interfaces/llm-provider.interface';

@Injectable()
export class PromptBuilderService {
  /**
   * Stitches together the system prompt, conversation history, 
   * memory context, and tool results into a final array of messages.
   */
  async buildPrompt(context: ExecutionContext, userMessage: string): Promise<ILLMMessage[]> {
    const messages: ILLMMessage[] = [];

    // 1. System Prompt (Placeholder for now)
    messages.push({
      role: 'system',
      content: 'You are Sammy, a highly capable AI Agent. Answer the user clearly and concisely.'
    });

    // 2. Memory / RAG Context (Future)
    if (context.memoryData) {
      messages.push({
        role: 'system',
        content: `Additional Context: ${JSON.stringify(context.memoryData)}`
      });
    }

    // 3. Conversation History (Mocked for now, will pull from DB later)
    // messages.push(...history)

    // 4. Current User Message
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }
}
