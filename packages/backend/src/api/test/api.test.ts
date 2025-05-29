import request from 'supertest';
import app from '../index';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

function generateToken(payload = { userId: 1 }) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
}

describe('Backend API Tests', () => {
  let token: string;

  beforeAll(() => {
    token = generateToken();
  });

  describe('Health Check', () => {
    it('should return status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('Authentication Middleware', () => {
    it('should reject requests without token', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Missing token');
    });

    it('should reject requests with invalid token', async () => {
      const res = await request(app).get('/api/projects').set('Authorization', 'Bearer invalidtoken');
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Invalid token');
    });

    it('should accept requests with valid token', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Projects API', () => {
    it('should get all projects', async () => {
      const res = await request(app).get('/api/projects').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get project by id', async () => {
      const res = await request(app).get('/api/projects/1').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent project', async () => {
      const res = await request(app).get('/api/projects/999').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });

    it('should create a new project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Project' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('name', 'New Project');
      expect(res.body).toHaveProperty('status', 'Active');
    });

    it('should reject project creation without name', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Project name is required');
    });

    it('should update project status', async () => {
      const res = await request(app)
        .patch('/api/projects/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'Completed' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'Completed');
    });
  });

  describe('Deployments API', () => {
    it('should reject deployment without required fields', async () => {
      const res = await request(app)
        .post('/api/deployments')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Missing required fields');
    });

    it('should reject deployment with invalid contract path', async () => {
      const res = await request(app)
        .post('/api/deployments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId: 1,
          contractName: 'TestContract',
          contractPath: 'invalid/path.sol',
          network: 'testnet',
          privateKey: '0x123'
        });
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Deployment failed');
    });

    it('should get deployment status', async () => {
      const res = await request(app)
        .get('/api/deployments/123')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('deploymentId', '123');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/unknown').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toHaveProperty('message', 'Not Found');
      expect(res.body.error.details).toContain('GET /api/unknown not found');
    });

    it('should handle internal server errors', async () => {
      // Simulate an error by passing invalid JSON
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid"json"}');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toHaveProperty('message', 'Internal Server Error');
    });
  });
});
