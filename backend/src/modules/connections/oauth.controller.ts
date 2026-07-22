import { Controller, Get, Query, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConnectionFactory } from './factories/connection.factory';
import { ConnectionStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Controller('connections')
export class OauthController {
  constructor(
    private readonly connectionFactory: ConnectionFactory,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  @Get('google/authorize')
  async authorizeGoogle(
    @Query('workspaceId') workspaceId: string,
    @Query('serverId') serverId: string,
    @Res() res: Response
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId) {
      return res.status(500).send('GOOGLE_CLIENT_ID is not configured');
    }

    // Store state so callback knows which workspace/server to attach this to
    const state = Buffer.from(JSON.stringify({ workspaceId: workspaceId || 'default', serverId: serverId || 'gmail' })).toString('base64');

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.compose'
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri || 'http://localhost:3001/connections/google/callback')}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&state=${state}`;

    return res.redirect(authUrl);
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') stateBase64: string,
    @Res() res: Response
  ) {
    if (!code) {
      return res.status(400).send('Missing authorization code');
    }

    let state;
    try {
      state = JSON.parse(Buffer.from(stateBase64, 'base64').toString('utf-8'));
    } catch (e) {
      return res.status(400).send('Invalid state parameter');
    }

    const provider = this.connectionFactory.getProviders().get('google');
    if (!provider) {
      return res.status(500).send('Google provider not registered');
    }

    try {
      // Upsert a record in the actual Prisma Connection table FIRST!
      // This is required because saveCredential expects a Connection record to link the Credential to.
      let connection = await this.prisma.connection.findFirst({
        where: {
          workspaceId: state.workspaceId,
          provider: 'google'
        }
      });
      
      if (connection) {
        connection = await this.prisma.connection.update({
          where: { id: connection.id },
          data: {
            status: ConnectionStatus.ACTIVE,
            updatedAt: new Date(),
          }
        });
      } else {
        connection = await this.prisma.connection.create({
          data: {
            workspaceId: state.workspaceId,
            provider: 'google',
            status: ConnectionStatus.ACTIVE
          }
        });
      }

      // Exchange code for tokens and save to DB via provider
      await (provider as any).exchangeCodeForTokens(
        { workspaceId: state.workspaceId, serverId: state.serverId },
        code
      );
      
      // Redirect back to frontend integrations page on success
      return res.redirect('http://localhost:3000/integrations');
    } catch (error) {
      console.error('OAuth Callback Error:', error);
      return res.status(500).send('Failed to exchange code for tokens. Check server logs.');
    }
  }
}
