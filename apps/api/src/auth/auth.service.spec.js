"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const orgs_service_1 = require("../orgs/orgs.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
describe('AuthService', () => {
    let service;
    let usersService;
    let prisma;
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
        get: jest.fn((key) => {
            if (key === 'JWT_ACCESS_SECRET')
                return 'access-secret';
            if (key === 'JWT_REFRESH_SECRET')
                return 'refresh-secret';
            if (key === 'JWT_ACCESS_EXPIRES_IN')
                return 900;
            if (key === 'JWT_REFRESH_EXPIRES_IN')
                return 604800;
            return null;
        }),
    };
    beforeEach(async () => {
        jest.clearAllMocks();
        mockPrisma.refreshToken.create.mockResolvedValue({});
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: users_service_1.UsersService, useValue: mockUsersService },
                { provide: orgs_service_1.OrgsService, useValue: mockOrgsService },
                { provide: audit_log_service_1.AuditLogService, useValue: mockAuditLog },
                { provide: jwt_1.JwtService, useValue: mockJwt },
                { provide: config_1.ConfigService, useValue: mockConfig },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        usersService = module.get(users_service_1.UsersService);
        prisma = module.get(prisma_service_1.PrismaService);
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
            await expect(service.register({ email: 'dup@example.com', password: 'password123' })).rejects.toThrow(common_1.ConflictException);
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
            await expect(service.login({ email: 'u@example.com', password: 'wrong' })).rejects.toThrow(common_1.UnauthorizedException);
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
            await expect(service.refresh('bad-token')).rejects.toThrow(common_1.UnauthorizedException);
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
            expect(result.memberships[0].role).toBe('ORG_OWNER');
        });
        it('throws UnauthorizedException when user not found', async () => {
            mockUsersService.findByIdWithMemberships.mockResolvedValue(null);
            await expect(service.me('missing')).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
});
