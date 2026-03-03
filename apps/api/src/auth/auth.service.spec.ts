import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    refreshToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  const mockUsersService = {
    findByEmail: jest.fn(),
    findByIdWithMemberships: jest.fn(),
    create: jest.fn(),
  };
  const mockOrgsService = {
    countOrganizations: jest.fn(),
    createOrganization: jest.fn(),
  };
  const mockAuditLog = {
    logAuthRegister: jest.fn(),
    logAuthLoginSuccess: jest.fn(),
    logAuthLoginFailure: jest.fn(),
    logAuthRefresh: jest.fn(),
    logAuthLogout: jest.fn(),
    create: jest.fn(),
  };
  const mockJwt = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn(),
  };
  const mockConfig = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_ACCESS_SECRET') return 'access-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
      if (key === 'JWT_ACCESS_EXPIRES_IN') return 900;
      if (key === 'JWT_REFRESH_EXPIRES_IN') return 604800;
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.refreshToken.create.mockResolvedValue({});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UsersService, useValue: mockUsersService },
        { provide: OrgsService, useValue: mockOrgsService },
        { provide: AuditLogService, useValue: mockAuditLog },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('register', () => {
    it('creates user and returns tokens', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 'user-1',
        email: 'u@example.com',
        name: null,
      });
      mockOrgsService.countOrganizations.mockResolvedValue(1);

      const result = await service.register({
        email: 'u@example.com',
        password: 'password123',
      });
      expect(result).toHaveProperty('accessToken', 'mock-token');
      expect(result).toHaveProperty('refreshToken', 'mock-token');
      expect(result.expiresIn).toBe(900);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('u@example.com');
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(mockAuditLog.logAuthRegister).toHaveBeenCalledWith('user-1', 'u@example.com');
    });

    it('throws ConflictException on duplicate email', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({ email: 'dup@example.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'u@example.com',
        passwordHash: '$2b$10$dummy.hash.for.test',
      });
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.login({
        email: 'u@example.com',
        password: 'password123',
      });
      expect(result.accessToken).toBe('mock-token');
      expect(mockAuditLog.logAuthLoginSuccess).toHaveBeenCalledWith('user-1', 'u@example.com');
    });

    it('throws UnauthorizedException on wrong password', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'u@example.com',
        passwordHash: '$2b$10$real.hash',
      });
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        service.login({ email: 'u@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockAuditLog.logAuthLoginFailure).toHaveBeenCalledWith('u@example.com', 'invalid_password');
    });
  });

  describe('refresh', () => {
    it('returns new tokens for valid refresh token', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'user-1', jti: 'abc', type: 'refresh' });
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 86400000),
        user: { id: 'user-1', email: 'u@example.com' },
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({});

      const result = await service.refresh('valid-refresh-jwt');
      expect(result.accessToken).toBe('mock-token');
      expect(mockAuditLog.logAuthRefresh).toHaveBeenCalledWith('user-1');
    });

    it('throws UnauthorizedException for invalid refresh token', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('invalid');
      });
      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('returns user and memberships', async () => {
      mockUsersService.findByIdWithMemberships.mockResolvedValue({
        id: 'user-1',
        email: 'u@example.com',
        name: 'Test',
        memberships: [
          {
            organizationId: 'org-1',
            role: 'ORG_OWNER',
            organization: { id: 'org-1', name: 'Org', slug: 'org' },
          },
        ],
      });
      const result = await service.me('user-1');
      expect(result.user.email).toBe('u@example.com');
      expect(result.memberships).toHaveLength(1);
      expect(result.memberships[0]?.role).toBe('ORG_OWNER');
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockUsersService.findByIdWithMemberships.mockResolvedValue(null);
      await expect(service.me('missing')).rejects.toThrow(UnauthorizedException);
    });
  });
});
