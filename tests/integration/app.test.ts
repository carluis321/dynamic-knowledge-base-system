import request from 'supertest';
import express from 'express';
import routes from '../../src/routes';
import { errorHandler, notFoundHandler } from '../../src/middlewares/errorHandler';

// Create test app
const createTestApp = () => {
  const app = express();
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
  
  // API routes
  app.use('/api', routes);
  
  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);
  
  return app;
};

describe('App Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number)
      });
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route GET /non-existent-route not found',
          timestamp: expect.any(String),
          path: '/non-existent-route',
          method: 'GET'
        }
      });
    });
  });

  describe('Error Handler', () => {
    it('should handle validation errors properly', async () => {
      const response = await request(app)
        .post('/api/resources')
        .send({
          // Missing required fields to trigger validation error
          url: 'invalid-url',
          type: 'invalid-type'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });
  });
});
