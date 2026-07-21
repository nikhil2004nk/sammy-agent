import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ILLMProvider, ILLMMessage, ILLMResponse, ILLMTool } from '../interfaces/llm-provider.interface';

@Injectable()
export class OpenAiProvider implements ILLMProvider, OnModuleInit {
  private readonly logger = new Logger(OpenAiProvider.name);
  private openai: OpenAI | null = null;
  private model: string = 'gpt-4o';

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const activeProvider = this.configService.get<string>('llm.provider');
    
    // We handle both 'openai' and 'openrouter' via the OpenAI SDK
    if (activeProvider === 'openai' || activeProvider === 'openrouter') {
      const apiKey = this.configService.get<string>(`llm.${activeProvider}.apiKey`);
      const baseUrl = this.configService.get<string>(`llm.${activeProvider}.baseUrl`);
      this.model = this.configService.get<string>(`llm.${activeProvider}.model`) || 'gpt-4o';

      if (apiKey) {
        this.openai = new OpenAI({ 
          apiKey: apiKey,
          baseURL: baseUrl,
          defaultHeaders: activeProvider === 'openrouter' ? {
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Sammy Agent Console',
          } : undefined
        });
      }

      if (!this.openai) {
        this.logger.error(`No API key provided for ${activeProvider}.`);
        throw new Error(`LLM Provider configuration failed: ${activeProvider} is active but missing API Key.`);
      }
    }
  }

  async generateResponse(
    messages: ILLMMessage[], 
    temperature: number, 
    maxTokens: number, 
    tools?: ILLMTool[],
    onToken?: (token: string) => void
  ): Promise<ILLMResponse> {
    if (!this.openai) {
      throw new Error('OpenAI Provider is not configured properly.');
    }

    this.logger.log(`Generating response with real OpenAI API (model: ${this.model})`);
    
    // Map messages to OpenAI format
    const openAiMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
      content: msg.content || ''
    })) as OpenAI.Chat.ChatCompletionMessageParam[];

    try {
      if (onToken) {
        const stream = await this.openai.chat.completions.create({
          model: this.model,
          messages: openAiMessages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        });

        let fullContent = '';
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            fullContent += delta;
            onToken(delta);
          }
        }
        
        return {
          content: fullContent,
          tokensUsed: 0, // Streaming doesn't always return usage easily
        };
      } else {
        const response = await this.openai.chat.completions.create({
          model: this.model,
          messages: openAiMessages,
          temperature,
          max_tokens: maxTokens,
        });

        return {
          content: response.choices[0].message.content || '',
          tokensUsed: response.usage?.total_tokens || 0,
        };
      }
    } catch (error: any) {
      this.logger.error(`OpenAI API error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
