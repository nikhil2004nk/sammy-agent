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
    maxTokens?: number, 
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
      const startTime = Date.now();
      const startDate = new Date();

      const openAiTools = tools && tools.length > 0 ? tools.map(t => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.inputSchema
        }
      })) : undefined;

      if (onToken) {
        const stream = await this.openai.chat.completions.create({
          model: this.model,
          messages: openAiMessages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
          stream_options: { include_usage: true },
          tools: openAiTools,
        });

        let fullContent = '';
        let finishReason = '';
        let usage = { prompt_tokens: 0, completion_tokens: 0 };
        let toolCalls: any[] = [];

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            fullContent += delta;
            onToken(delta);
          }
          
          if (chunk.choices[0]?.delta?.tool_calls) {
            for (const tc of chunk.choices[0].delta.tool_calls) {
              const index = tc.index;
              if (!toolCalls[index]) {
                toolCalls[index] = { id: tc.id, type: tc.type, function: { name: tc.function?.name || '', arguments: '' } };
              }
              if (tc.function?.arguments) {
                toolCalls[index].function.arguments += tc.function.arguments;
              }
            }
          }

          if (chunk.choices[0]?.finish_reason) {
            finishReason = chunk.choices[0].finish_reason;
          }
          if ((chunk as any).usage) {
            usage = (chunk as any).usage;
          }
        }
        
        const endTime = Date.now();
        const endDate = new Date();
        
        this.logger.log(`
[LLM]
Provider       OpenAI
Model          ${this.model}
Started        ${startDate.toISOString()}
Completed      ${endDate.toISOString()}
Latency        ${endTime - startTime} ms
Input Tokens   ${usage.prompt_tokens}
Output Tokens  ${usage.completion_tokens}
Finish Reason  ${finishReason || 'unknown'}
        `);

        return {
          content: fullContent,
          toolCalls: toolCalls.length > 0 ? toolCalls.map(tc => {
            let parsedArgs = {};
            try {
              if (tc.function.arguments) {
                parsedArgs = JSON.parse(tc.function.arguments);
              }
            } catch (e) {
              this.logger.error(`Failed to parse tool arguments for ${tc.function.name}: ${tc.function.arguments}`);
            }
            return {
              id: tc.id,
              name: tc.function.name,
              arguments: parsedArgs
            };
          }) : undefined,
          tokensUsed: usage.prompt_tokens + usage.completion_tokens,
          usage: {
            prompt: usage.prompt_tokens,
            completion: usage.completion_tokens,
            finishReason: finishReason || 'unknown',
            model: this.model,
            provider: 'OpenAI'
          }
        };
      } else {
        const response = await this.openai.chat.completions.create({
          model: this.model,
          messages: openAiMessages,
          temperature,
          max_tokens: maxTokens,
          tools: openAiTools,
        });

        const endTime = Date.now();
        const endDate = new Date();
        
        this.logger.log(`
[LLM]
Provider       OpenAI
Model          ${this.model}
Started        ${startDate.toISOString()}
Completed      ${endDate.toISOString()}
Latency        ${endTime - startTime} ms
Input Tokens   ${response.usage?.prompt_tokens || 0}
Output Tokens  ${response.usage?.completion_tokens || 0}
Finish Reason  ${response.choices[0]?.finish_reason || 'unknown'}
        `);

        let parsedToolCalls: any[] | undefined = undefined;
        const msgToolCalls = response.choices[0].message.tool_calls;
        if (msgToolCalls && msgToolCalls.length > 0) {
          parsedToolCalls = msgToolCalls.map(tc => {
            let parsedArgs = {};
            const func = (tc as any).function;
            try {
              if (func && func.arguments) {
                parsedArgs = JSON.parse(func.arguments);
              }
            } catch (e) {
              this.logger.error(`Failed to parse tool arguments for ${func?.name}: ${func?.arguments}`);
            }
            return {
              id: tc.id,
              name: func?.name,
              arguments: parsedArgs
            };
          });
        }

        return {
          content: response.choices[0].message.content || '',
          toolCalls: parsedToolCalls,
          tokensUsed: response.usage?.total_tokens || 0,
          usage: {
            prompt: response.usage?.prompt_tokens || 0,
            completion: response.usage?.completion_tokens || 0,
            finishReason: response.choices[0]?.finish_reason || 'unknown',
            model: this.model,
            provider: 'OpenAI'
          }
        };
      }
    } catch (error: any) {
      this.logger.error(`OpenAI API error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
