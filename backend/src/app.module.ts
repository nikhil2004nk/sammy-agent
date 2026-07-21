import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from './modules/config/config.module';
import { EventsModule } from './modules/events/events.module';
import { ObservabilityModule } from './modules/observability/observability.module';

import { RuntimeModule } from './modules/runtime/runtime.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { AgentsModule } from './modules/agents/agents.module';
import { LlmModule } from './modules/llm/llm.module';
import { PromptsModule } from './modules/prompts/prompts.module';
import { ToolsModule } from './modules/tools/tools.module';
import { McpModule } from './modules/mcp/mcp.module';
import { RegistryModule } from './modules/registry/registry.module';
import { WorkflowsModule } from './modules/workflows/workflow.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule,
    ObservabilityModule,
    EventsModule,
    DatabaseModule,
    AuthModule,
    WorkspacesModule,
    
    LlmModule,
    PromptsModule,
    ToolsModule,
    McpModule,
    AgentsModule,
    ConversationModule,
    RuntimeModule,
    RegistryModule,
    WorkflowsModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
