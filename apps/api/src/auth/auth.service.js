"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const SALT_ROUNDS = 10;
let AuthService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = _classThis = class {
        constructor(prisma, usersService, orgsService, auditLog, jwtService, config) {
            this.prisma = prisma;
            this.usersService = usersService;
            this.orgsService = orgsService;
            this.auditLog = auditLog;
            this.jwtService = jwtService;
            this.config = config;
        }
        async register(dto) {
            const email = dto.email.toLowerCase().trim();
            const existing = await this.usersService.findByEmail(email);
            if (existing) {
                await this.auditLog.create({
                    action: 'auth.register.failure',
                    resourceType: 'user',
                    payload: { email, reason: 'duplicate_email' },
                });
                throw new common_1.ConflictException('An account with this email already exists');
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
        async login(dto) {
            const email = dto.email.toLowerCase().trim();
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                await this.auditLog.logAuthLoginFailure(email, 'user_not_found');
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            const valid = await bcrypt.compare(dto.password, user.passwordHash);
            if (!valid) {
                await this.auditLog.logAuthLoginFailure(email, 'invalid_password');
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            await this.auditLog.logAuthLoginSuccess(user.id, user.email);
            return this.issueTokenPair(user.id, user.email);
        }
        async refresh(refreshToken) {
            let payload;
            try {
                payload = this.jwtService.verify(refreshToken, {
                    secret: this.config.get('JWT_REFRESH_SECRET'),
                });
            }
            catch (_a) {
                throw new common_1.UnauthorizedException('Invalid or expired refresh token');
            }
            if (payload.type !== 'refresh' || !payload.jti) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const tokenHash = this.hashToken(payload.jti);
            const stored = await this.prisma.refreshToken.findFirst({
                where: { tokenHash },
                include: { user: true },
            });
            if (!stored || stored.expiresAt < new Date()) {
                if (stored) {
                    await this.prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => { });
                }
                throw new common_1.UnauthorizedException('Invalid or expired refresh token');
            }
            await this.prisma.refreshToken.delete({ where: { id: stored.id } });
            await this.auditLog.logAuthRefresh(stored.userId);
            return this.issueTokenPair(stored.userId, stored.user.email);
        }
        async me(userId) {
            const user = await this.usersService.findByIdWithMemberships(userId);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
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
        async logout(userId, refreshToken) {
            if (refreshToken) {
                const tokenHash = this.hashToken(refreshToken);
                await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
            }
            await this.auditLog.logAuthLogout(userId);
        }
        async issueTokenPair(userId, email) {
            const accessExpiresIn = this.config.get('JWT_ACCESS_EXPIRES_IN', 900);
            const refreshExpiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN', 604800);
            const accessToken = this.jwtService.sign({ sub: userId, email, type: 'access' }, { expiresIn: accessExpiresIn, secret: this.config.get('JWT_ACCESS_SECRET') });
            const jti = (0, crypto_1.randomBytes)(32).toString('hex');
            const refreshTokenHash = this.hashToken(jti);
            const expiresAt = new Date(Date.now() + refreshExpiresIn * 1000);
            await this.prisma.refreshToken.create({
                data: { userId, tokenHash: refreshTokenHash, expiresAt },
            });
            const refreshToken = this.jwtService.sign({ sub: userId, jti, type: 'refresh' }, { expiresIn: refreshExpiresIn, secret: this.config.get('JWT_REFRESH_SECRET') });
            return {
                accessToken,
                refreshToken,
                expiresIn: accessExpiresIn,
            };
        }
        hashToken(token) {
            return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
        }
    };
    __setFunctionName(_classThis, "AuthService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
})();
exports.AuthService = AuthService;
