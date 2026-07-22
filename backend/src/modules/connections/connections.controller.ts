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
    const connection = await this.prisma.connection.create({
      data: {
        workspaceId,
        provider: data.provider,
        status: 'PENDING'
      }
    });
    return connection;
  }

  @Delete('workspaces/:workspaceId/connections/:id')
  async deleteConnection(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id } });
    if (!connection || connection.workspaceId !== workspaceId) {
      return { success: false, message: 'Connection not found' };
    }
    
    await this.prisma.connection.delete({ where: { id } });
    return { success: true };
  }

  @Post('workspaces/:workspaceId/connections/:id/reconnect')
  async reconnectConnection(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id } });
    if (!connection || connection.workspaceId !== workspaceId) {
      return { success: false, message: 'Connection not found' };
    }
    // For OAuth connections, reconnect must happen via frontend redirect
    return { success: false, message: 'OAuth connections must be re-authenticated via the browser flow' };
  }

  @Post('workspaces/:workspaceId/connections/:id/refresh')
  async refreshConnection(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id } });
    if (!connection || connection.workspaceId !== workspaceId) {
      return { success: false, message: 'Connection not found' };
    }
    
    const context: ConnectionContext = { workspaceId, serverId: connection.provider === 'google' ? 'gmail' : connection.provider };
    const provider = this.connectionFactory.getProviders().get(connection.provider);
    
    if (provider && 'refreshAccessToken' in provider) {
      const credential = await this.credentialService.getCredential(context);
      if (credential) {
        try {
          await (provider as any).refreshAccessToken(context, credential);
          return { success: true, message: 'Token refreshed successfully' };
        } catch (e) {
          return { success: false, message: 'Refresh failed: ' + (e as Error).message };
        }
      }
    }
    
    return { success: false, message: 'Failed to refresh token or unsupported provider' };
  }

  @Get('workspaces/:workspaceId/connections/:id/health')
  async getConnectionHealth(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id } });
    if (!connection || connection.workspaceId !== workspaceId) {
      return { success: false, message: 'Connection not found' };
    }
    
    const context: ConnectionContext = { workspaceId, serverId: connection.provider === 'google' ? 'gmail' : connection.provider };
    const isExpired = await this.credentialService.isCredentialExpired(context);
    
    if (isExpired) {
      return { id, status: 'expired', message: 'Credentials have expired' };
    }
    
    return { id, status: 'healthy', message: 'Connection is active' };
  }
}
