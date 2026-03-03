"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const health_controller_1 = require("./health.controller");
describe('HealthController', () => {
    let controller;
    beforeEach(async () => {
        const app = await testing_1.Test.createTestingModule({
            controllers: [health_controller_1.HealthController],
        }).compile();
        controller = app.get(health_controller_1.HealthController);
    });
    describe('getHealth', () => {
        it('returns { status: "ok" }', () => {
            expect(controller.getHealth()).toEqual({ status: 'ok' });
        });
    });
});
