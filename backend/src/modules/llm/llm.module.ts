import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAiProvider } from './providers/openai.provider';
import { LlmFactoryService } from './factory/llm-factory.service';

@Module({
  imports: [ConfigModule],
  providers: [OpenAiProvider, LlmFactoryService],
  exports: [LlmFactoryService],
})
export class LlmModule {}
