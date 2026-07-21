import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { llmConfig } from './llm.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [llmConfig],
    }),
  ],
  providers: [],
  exports: [NestConfigModule],
})
export class ConfigModule {}
