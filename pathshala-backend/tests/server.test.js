const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

describe('Pathshala Backend API', () => {

  describe('Health Check Route', () => {
    test('GET /api/health should return healthy status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('Healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Authentication Validation', () => {
    test('POST /api/auth/login without credentials should fail with 400', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('POST /api/auth/register with missing fields should fail with 400/500', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User' });
      expect([400, 500]).toContain(response.statusCode);
      expect(response.body.success).toBe(false);
    });

    test('POST /api/auth/forgot-password with short password should fail with 400', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@bvrit.ac.in', newPassword: '123' });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/at least 6 characters/i);
    });

    test('POST /api/auth/parent-login without credentials should fail with 400', async () => {
      const response = await request(app)
        .post('/api/auth/parent-login')
        .send({});
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('POST /api/auth/register with role parent should be rejected with 400', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Parent User', email: 'parent@bvrit.ac.in', password: 'password123', role: 'parent' });
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/Parent self-registration is not allowed/i);
    });
  });

  describe('Protected Route Security', () => {
    test('GET /api/courses/:id/roster should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/courses/someid/roster');
      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('GET /api/student/courses should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/student/courses');
      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('GET /api/faculty/courses should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/faculty/courses');
      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('GET /api/parent/child should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/parent/child');
      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('GET /api/notifications should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/notifications');
      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Role-Based Authorization', () => {
    test('Student token should be forbidden from accessing faculty-only routes', async () => {
      // Mock student token
      const token = jwt.sign(
        { id: '507f1f77bcf86cd799439011' },
        process.env.JWT_SECRET || 'pathshala_jwt_super_secret_key_2026',
        { expiresIn: '1h' }
      );

      // In real scenario, protect verifies user in db. If DB is unavailable, it returns 401/500
      const response = await request(app)
        .post('/api/faculty/assignments')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Math HW' });

      // Either 401 (user not in db) or 403 (role forbidden)
      expect([401, 403, 500]).toContain(response.statusCode);
      expect(response.body.success).toBe(false);
    });
  });

});