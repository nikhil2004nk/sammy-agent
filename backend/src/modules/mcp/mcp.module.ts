import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import mcpConfig from './config/mcp.config';
import { McpManagerService } from './manager/mcp-manager.service';
import { McpHealthMonitor } from './health/mcp-health.monitor';
import { McpDiscoveryService } from './discovery/mcp-discovery.service';

@Module({
  imports: [
    ConfigModule.forFeature(mcpConfig),
    ScheduleModule.forRoot(),
  ],
  providers: [McpManagerService, McpHealthMonitor, McpDiscoveryService],
  exports: [McpManagerService, McpDiscoveryService],
})
export class McpModule {}
