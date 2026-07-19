import { Module } from '@nestjs/common';
import { OpenAiProvider } from './providers/openai.provider';
import { LlmFactoryService } from './factory/llm-factory.service';

@Module({
  providers: [OpenAiProvider, LlmFactoryService],
  exports: [LlmFactoryService],
})
export class LlmModule {}
