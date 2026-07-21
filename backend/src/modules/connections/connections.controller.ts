import { Controller, Get, Param, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { ConnectionFactory } from './factories/connection.factory';
import { CredentialService } from './credentials/credential.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConnectionContext } from './types/connection.types';

@UseGuards(JwtAuthGuard)
@Controller()
export class ConnectionsController {
  constructor(
    private readonly connectionFactory: ConnectionFactory,
    private readonly credentialService: CredentialService
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
    // In a real implementation, we would query the Connections table from DB.
    // For this mock phase, we'll return an empty list or mock list.
    return [];
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
}
