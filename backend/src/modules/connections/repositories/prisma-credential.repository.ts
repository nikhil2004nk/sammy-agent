import { Injectable, Logger } from '@nestjs/common';
import { CredentialRepository } from '../interfaces/credential-repository.interface';
import { ConnectionContext, ConnectionCredential } from '../types/connection.types';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaCredentialRepository implements CredentialRepository {
  private readonly logger = new Logger(PrismaCredentialRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async saveCredential(context: ConnectionContext, credential: ConnectionCredential): Promise<void> {
    // We need to find the Connection ID for this workspace and provider (since serverId maps to provider, we can just use the provider in connection)
    // The connection table has `workspaceId` and `provider`. 
    // In our system, the UI creates a Connection for 'google'.
    
    // First, find the connection record
    const connection = await this.prisma.connection.findFirst({
      where: {
        workspaceId: context.workspaceId,
        provider: 'google' // currently hardcoded as google, since google maps to gmail server
      }
    });

    if (!connection) {
      this.logger.warn(`No connection record found for workspace ${context.workspaceId}. Cannot save credential to DB.`);
      return;
    }

    // Now upsert the Credential record
    const existingCredential = await this.prisma.credential.findFirst({
      where: { connectionId: connection.id }
    });

    if (existingCredential) {
      await this.prisma.credential.update({
        where: { id: existingCredential.id },
        data: {
          encryptedAccessToken: credential.values.accessToken,
          encryptedRefreshToken: credential.values.refreshToken,
          expiresAt: credential.expiresAt,
          updatedAt: new Date()
        }
      });
    } else {
      await this.prisma.credential.create({
        data: {
          connectionId: connection.id,
          encryptedAccessToken: credential.values.accessToken,
          encryptedRefreshToken: credential.values.refreshToken,
          scopes: [],
          expiresAt: credential.expiresAt
        }
      });
    }
  }

  async getCredential(context: ConnectionContext): Promise<ConnectionCredential | null> {
    const connection = await this.prisma.connection.findFirst({
      where: {
        workspaceId: context.workspaceId,
        provider: 'google'
      },
      include: {
        credentials: true
      }
    });

    if (!connection || !connection.credentials || connection.credentials.length === 0) {
      return null;
    }

    const cred = connection.credentials[0];
    
    return {
      scheme: 'oauth2',
      values: {
        accessToken: cred.encryptedAccessToken || '',
        refreshToken: cred.encryptedRefreshToken || '',
      },
      expiresAt: cred.expiresAt || undefined
    };
  }

  async deleteCredential(context: ConnectionContext): Promise<void> {
    const connection = await this.prisma.connection.findFirst({
      where: {
        workspaceId: context.workspaceId,
        provider: 'google'
      }
    });

    if (connection) {
      await this.prisma.credential.deleteMany({
        where: { connectionId: connection.id }
      });
    }
  }
}
