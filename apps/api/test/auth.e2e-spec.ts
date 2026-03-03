import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testEmail = `e2e-${Date.now()}@example.com`;
  const testPassword = 'password123';
  let accessToken: string;
  let refreshToken: string;

  describe('POST /auth/register', () => {
    it('returns 201 and tokens', async () => {
      const res = await request(app.getHttpServer())
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
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: testEmail, password: testPassword })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('returns 200 and tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(200);
      expect(res.body).toHaveProperty('accessToken');
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('returns 401 for wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testEmail, password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('returns 200 and new tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);
      expect(res.body).toHaveProperty('accessToken');
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('returns 401 for invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid' })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('returns 200 and user + memberships with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.user).toHaveProperty('email', testEmail);
      expect(res.body).toHaveProperty('memberships');
    });

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('returns 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid')
        .expect(401);
    });
  });

  describe('Permission: POST /orgs (ORG_OWNER only)', () => {
    let workerEmail: string;
    let workerAccessToken: string;

    beforeAll(async () => {
      workerEmail = `worker-${Date.now()}@example.com`;
      const reg = await request(app.getHttpServer())
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
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: workerEmail, password: testPassword });
      const token = loginRes.body.accessToken;
      await request(app.getHttpServer())
        .post('/orgs')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Org', slug: 'new-org' })
        .expect(403);
    });

    it('returns 201 when user has ORG_OWNER role', async () => {
      await request(app.getHttpServer())
        .post('/orgs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Owner Org', slug: `owner-org-${Date.now()}` })
        .expect(201);
    });
  });
});

