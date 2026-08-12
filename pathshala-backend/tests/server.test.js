const request = require('supertest');
const app = require('../app');

describe('Pathshala Backend API', () => {

    test('GET /api/health should return healthy status', async () => {
        const response = await request(app)
            .get('/api/health');

        expect(response.statusCode).toBe(200);

        expect(response.body.status).toBe('Healthy');
    });

});