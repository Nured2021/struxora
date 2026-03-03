import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserWithMemberships } from '../users/users.service';
import { Role } from '@prisma/client';

const SALT_ROUNDS = 10;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  memberships: Array<{
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    role: Role;
  }>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly orgsService: OrgsService,
    private readonly auditLog: AuditLogService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      await this.auditLog.create({
        action: 'auth.register.failure',
        resourceType: 'user',
        payload: { email, reason: 'duplicate_email' },
      });
      throw new ConflictException('An account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create({
      email,
      passwordHash,
      name: dto.name,
    });
    if (dto.organizationName && dto.organizationName.trim()) {
      const orgCount = await this.orgsService.countOrganizations();
      if (orgCount === 0) {
        const slug = dto.organizationName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `org-${user.id.slice(0, 8)}`;
        await this.orgsService.createOrganization({
          name: dto.organizationName.trim(),
          slug,
          createdByUserId: user.id,
        });
      }
    }
    await this.auditLog.logAuthRegister(user.id, user.email);
    return this.issueTokenPair(user.id, user.email);
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      await this.auditLog.logAuthLoginFailure(email, 'user_not_found');
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.auditLog.logAuthLoginFailure(email, 'invalid_password');
      throw new UnauthorizedException('Invalid email or password');
    }
    await this.auditLog.logAuthLoginSuccess(user.id, user.email);
    return this.issueTokenPair(user.id, user.email);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: { sub: string; jti?: string; type?: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (payload.type !== 'refresh' || !payload.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokenHash = this.hashToken(payload.jti);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: { user: true },
    });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => {});
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    await this.auditLog.logAuthRefresh(stored.userId);
    return this.issueTokenPair(stored.userId, stored.user.email);
  }

  async me(userId: string): Promise<MeResponse> {
    const user = await this.usersService.findByIdWithMemberships(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      memberships: user.memberships.map((m) => ({
        organizationId: m.organization.id,
        organizationName: m.organization.name,
        organizationSlug: m.organization.slug,
        role: m.role,
      })),
    };
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
    }
    await this.auditLog.logAuthLogout(userId);
  }

  private async issueTokenPair(userId: string, email: string): Promise<TokenPair> {
    const accessExpiresIn = Number(this.config.get('JWT_ACCESS_EXPIRES_IN', 900)) || 900;
    const refreshExpiresIn = Number(this.config.get('JWT_REFRESH_EXPIRES_IN', 604800)) || 604800;
    const accessToken = this.jwtService.sign(
      { sub: userId, email, type: 'access' },
      { expiresIn: accessExpiresIn, secret: this.config.get<string>('JWT_ACCESS_SECRET') },
    );
    const jti = randomBytes(32).toString('hex');
    const refreshTokenHash = this.hashToken(jti);
    const expiresAt = new Date(Date.now() + refreshExpiresIn * 1000);
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: refreshTokenHash, expiresAt },
    });
    const refreshToken = this.jwtService.sign(
      { sub: userId, jti, type: 'refresh' },
      { expiresIn: refreshExpiresIn, secret: this.config.get<string>('JWT_REFRESH_SECRET') },
    );
    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
