"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const supertest_1 = require("supertest");
const app_module_1 = require("../src/app.module");
const prisma_service_1 = require("../src/prisma/prisma.service");
describe('Auth (e2e)', () => {
    let app;
    let prisma;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get(prisma_service_1.PrismaService);
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    const testEmail = `e2e-${Date.now()}@example.com`;
    const testPassword = 'password123';
    let accessToken;
    let refreshToken;
    describe('POST /auth/register', () => {
        it('returns 201 and tokens', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/register')
                .send({
                email: testEmail,
                password: testPassword,
                organizationName: 'E2E Test Org',
            })
                .expect(201);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
            expect(res.body).toHaveProperty('expiresIn');
            accessToken = res.body.accessToken;
            refreshToken = res.body.refreshToken;
        });
        it('returns 409 for duplicate email', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/register')
                .send({ email: testEmail, password: testPassword })
                .expect(409);
        });
    });
    describe('POST /auth/login', () => {
        it('returns 200 and tokens', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/login')
                .send({ email: testEmail, password: testPassword })
                .expect(200);
            expect(res.body).toHaveProperty('accessToken');
            accessToken = res.body.accessToken;
            refreshToken = res.body.refreshToken;
        });
        it('returns 401 for wrong password', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/login')
                .send({ email: testEmail, password: 'wrongpassword' })
                .expect(401);
        });
    });
    describe('POST /auth/refresh', () => {
        it('returns 200 and new tokens', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/refresh')
                .send({ refreshToken })
                .expect(200);
            expect(res.body).toHaveProperty('accessToken');
            accessToken = res.body.accessToken;
            refreshToken = res.body.refreshToken;
        });
        it('returns 401 for invalid refresh token', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/refresh')
                .send({ refreshToken: 'invalid' })
                .expect(401);
        });
    });
    describe('GET /auth/me', () => {
        it('returns 200 and user + memberships with valid token', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            expect(res.body.user).toHaveProperty('email', testEmail);
            expect(res.body).toHaveProperty('memberships');
        });
        it('returns 401 without token', async () => {
            await (0, supertest_1.default)(app.getHttpServer()).get('/auth/me').expect(401);
        });
        it('returns 401 with invalid token', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/auth/me')
                .set('Authorization', 'Bearer invalid')
                .expect(401);
        });
    });
    describe('Permission: POST /orgs (ORG_OWNER only)', () => {
        let workerEmail;
        let workerAccessToken;
        beforeAll(async () => {
            workerEmail = `worker-${Date.now()}@example.com`;
            const reg = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/register')
                .send({ email: workerEmail, password: testPassword });
            workerAccessToken = reg.body.accessToken;
            const user = await prisma.user.findUnique({ where: { email: workerEmail } });
            if (user) {
                const org = await prisma.organization.findFirst();
                if (org) {
                    await prisma.membership.create({
                        data: {
                            organizationId: org.id,
                            userId: user.id,
                            role: "WORKER",
                        },
                    });
                }
            }
        });
        it('returns 403 when user has WORKER role (no ORG_OWNER)', async () => {
            const loginRes = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/login')
                .send({ email: workerEmail, password: testPassword });
            const token = loginRes.body.accessToken;
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/orgs')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'New Org', slug: 'new-org' })
                .expect(403);
        });
        it('returns 201 when user has ORG_OWNER role', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/orgs')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ name: 'Owner Org', slug: `owner-org-${Date.now()}` })
                .expect(201);
        });
    });
});
