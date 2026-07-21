import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await argon2.hash(dto.password);

    // Transaction to create User, Workspace, Membership
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          name: dto.name,
        }
      });

      const workspace = await tx.workspace.create({
        data: {
          name: 'Sammy Personal',
        }
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: newUser.id,
          role: 'OWNER'
        }
      });

      return newUser;
    });

    return this.createSessionAndTokens(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createSessionAndTokens(user.id);
  }

  async refresh(refreshToken: string) {
    // Note: Doing a linear scan is inefficient. It's better to lookup by session ID included in the token.
    // For production, the refreshToken would be something like `${sessionId}.${token}`.
    // Let's implement that to avoid fetching all active sessions.
    const [sessionId, tokenValue] = refreshToken.split('.');
    if (!sessionId || !tokenValue) throw new UnauthorizedException('Invalid token format');

    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    const isValid = await argon2.verify(session.refreshTokenHash, tokenValue);
    if (!isValid) {
      throw new UnauthorizedException('Invalid token signature');
    }

    // Revoke old session and issue new one to rotate refresh token
    await this.prisma.session.delete({ where: { id: sessionId } });
    return this.createSessionAndTokens(session.userId);
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    const [sessionId, tokenValue] = refreshToken.split('.');
    if (!sessionId || !tokenValue) return;

    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (session) {
       const isValid = await argon2.verify(session.refreshTokenHash, tokenValue);
       if (isValid) {
         await this.prisma.session.delete({ where: { id: sessionId } });
       }
    }
  }

  private async createSessionAndTokens(userId: string) {
    const accessToken = this.jwtService.sign({ sub: userId }, { expiresIn: '15m' });
    const rawTokenValue = randomBytes(32).toString('hex');
    const refreshTokenHash = await argon2.hash(rawTokenValue);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt
      }
    });

    const refreshToken = `${session.id}.${rawTokenValue}`;

    return {
      accessToken,
      refreshToken
    };
  }
}
