import { Injectable, NotFoundException } from '@nestjs/common';
import { ILLMProvider } from '../interfaces/llm-provider.interface';
import { OpenAiProvider } from '../providers/openai.provider';

@Injectable()
export class LlmFactoryService {
  constructor(private readonly openAiProvider: OpenAiProvider) {}

  getProvider(providerName: string): ILLMProvider {
    switch (providerName.toLowerCase()) {
      case 'openai':
        return this.openAiProvider;
      // Future: case 'anthropic': return this.anthropicProvider;
      default:
        throw new NotFoundException(`LLM Provider '${providerName}' not supported`);
    }
  }
}
