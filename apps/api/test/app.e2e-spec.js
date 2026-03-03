"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = require("supertest");
const app_module_1 = require("../src/app.module");
describe('GET /health', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('returns 200 and { status: "ok" }', () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .get('/health')
            .expect(200)
            .expect((res) => {
            expect(res.body).toEqual({ status: 'ok' });
        });
    });
});
