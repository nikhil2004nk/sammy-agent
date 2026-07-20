import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ILLMProvider, ILLMMessage, ILLMResponse, ILLMTool } from '../interfaces/llm-provider.interface';

@Injectable()
export class OpenAiProvider implements ILLMProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private openai: OpenAI | null = null;
  private readonly isMock: boolean;

  constructor(private configService: ConfigService) {
    this.isMock = this.configService.get<string>('USE_MOCK_LLM') === 'true';
    if (!this.isMock) {
      const openRouterKey = this.configService.get<string>('OPENROUTER_API_KEY');
      const openAiKey = this.configService.get<string>('OPENAI_API_KEY');
      
      if (openRouterKey) {
        this.openai = new OpenAI({ 
          apiKey: openRouterKey,
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': 'http://localhost:3000', // Required by OpenRouter
            'X-Title': 'Sammy Agent Console',
          }
        });
      } else if (openAiKey) {
        this.openai = new OpenAI({ apiKey: openAiKey });
      } else {
        this.logger.warn('No API key set. Falling back to Mock mode.');
        this.isMock = true;
      }
    }
  }

  async generateResponse(messages: ILLMMessage[], temperature: number, maxTokens: number, tools?: ILLMTool[]): Promise<ILLMResponse> {
    if (this.isMock || !this.openai) {
      this.logger.log('Generating response with OpenAI provider (Mock Mode)');
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        content: "This is a simulated response from the Sammy Agent Platform OpenAI Provider.",
        tokensUsed: 42
      };
    }

    this.logger.log('Generating response with real OpenAI API');
    
    // Map messages to OpenAI format
    const openAiMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
      content: msg.content || ''
    })) as OpenAI.Chat.ChatCompletionMessageParam[];

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // or gpt-4-turbo
        messages: openAiMessages,
        temperature,
        max_tokens: maxTokens,
      });

      return {
        content: response.choices[0].message.content || '',
        tokensUsed: response.usage?.total_tokens || 0,
      };
    } catch (error: any) {
      this.logger.error(`OpenAI API error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
