import { Module } from '@nestjs/common';
import { ToolExecutorService } from './tool-executor.service';

@Module({
  providers: [ToolExecutorService],
  exports: [ToolExecutorService],
})
export class ToolsModule {}
