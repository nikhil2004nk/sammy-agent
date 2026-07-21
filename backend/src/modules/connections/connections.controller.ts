import { Controller, Get, Param, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { ConnectionFactory } from './factories/connection.factory';
import { CredentialService } from './credentials/credential.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConnectionContext } from './types/connection.types';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class ConnectionsController {
  constructor(
    private readonly connectionFactory: ConnectionFactory,
    private readonly credentialService: CredentialService,
    private readonly prisma: PrismaService
  ) {}

  @Get('providers')
  async getProviders() {
    const providers = this.connectionFactory.getProviders();
    return Array.from(providers.values()).map(p => ({
      id: p.getProviderId(),
      name: p.getProviderId() === 'google' ? 'Google' : p.getProviderId() === 'oauth2' ? 'OAuth 2.0 (Generic)' : p.getProviderId(),
      type: 'oauth2'
    }));
  }

  @Get('workspaces/:workspaceId/connections')
  async getConnections(@Param('workspaceId') workspaceId: string) {
    return this.prisma.connection.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post('workspaces/:workspaceId/connections')
  async createConnection(@Param('workspaceId') workspaceId: string, @Body() data: any) {
    // Logic to create connection
    return { success: true };
  }

  @Delete('workspaces/:workspaceId/connections/:id')
  async deleteConnection(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    // Logic to delete connection
    return { success: true };
  }

  @Post('workspaces/:workspaceId/connections/:id/reconnect')
  async reconnectConnection(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    // Logic to reconnect/re-authenticate connection
    return { success: true, message: 'Reconnected' };
  }

  @Post('workspaces/:workspaceId/connections/:id/refresh')
  async refreshConnection(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    // Logic to refresh tokens
    return { success: true, message: 'Refreshed' };
  }

  @Get('workspaces/:workspaceId/connections/:id/health')
  async getConnectionHealth(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    // Logic to check connection health/validity
    return { id, status: 'healthy', message: 'Connection is active' };
  }
}
