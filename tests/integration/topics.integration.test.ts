import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import routes from '../../src/routes';
import { errorHandler, notFoundHandler } from '../../src/middlewares/errorHandler';
import { UserRole } from '../../src/core/types/user';

// Mock the topic storage
jest.mock('../../src/services/topics/topic_storage', () => ({
  getAllTopics: jest.fn(),
  createTopic: jest.fn(),
  updateTopic: jest.fn(),
  getTopicById: jest.fn(),
  deleteTopic: jest.fn(),
}));

// Mock JWT for testing
const JWT_SECRET = 'test-secret-key';
process.env.JWT_SECRET = JWT_SECRET;

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api', routes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe('Topics Integration Tests', () => {
  let app: express.Application;
  const mockTopicStorage = require('../../src/services/topics/topic_storage');

  // Helper function to generate JWT tokens for testing
  const generateToken = (role: UserRole, userId = 'test-user-id', email = 'test@example.com') => {
    return jwt.sign(
      { id: userId, email, scope: role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  };

  const adminToken = generateToken('Admin');
  const editorToken = generateToken('Editor');
  const userToken = generateToken('Viewer');

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validTopic = {
    name: 'Test Topic',
    content: 'Test topic content',
    parentTopicId: null,
  };

  const mockTopicResponse = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    ...validTopic,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  describe('GET /api/topics', () => {
    it('should return all topics for authenticated user', async () => {
      mockTopicStorage.getAllTopics.mockReturnValue([mockTopicResponse]);

      const response = await request(app)
        .get('/api/topics')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toEqual([mockTopicResponse]);
      expect(mockTopicStorage.getAllTopics).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/topics')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('GET /api/topics/:id', () => {
    it('should return topic by id for authenticated user', async () => {
      mockTopicStorage.getTopicById.mockReturnValue(mockTopicResponse);

      const response = await request(app)
        .get(`/api/topics/${mockTopicResponse.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toEqual(mockTopicResponse);
      expect(mockTopicStorage.getTopicById).toHaveBeenCalledWith(mockTopicResponse.id);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get(`/api/topics/${mockTopicResponse.id}`)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should return 404 when topic not found', async () => {
      mockTopicStorage.getTopicById.mockImplementation(() => {
        throw new Error('Topic not found');
      });

      const validUuid = '123e4567-e89b-12d3-a456-426614174999';
      const response = await request(app)
        .get(`/api/topics/${validUuid}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/topics/invalid-uuid')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/topics/shortest-path', () => {
    it('should return shortest path for authenticated user', async () => {
      const pathRequest = {
        startTopicId: '123e4567-e89b-12d3-a456-426614174001',
        endTopicId: '123e4567-e89b-12d3-a456-426614174002'
      };

      const mockPath = ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'];

      // Mock the controller response
      const response = await request(app)
        .post('/api/topics/shortest-path')
        .set('Authorization', `Bearer ${userToken}`)
        .send(pathRequest)
        .expect(200);

      // Note: This would need proper mocking of the shortest path logic
      // For now, we just test the authentication and validation
    });

    it('should return 401 for unauthenticated request', async () => {
      const pathRequest = {
        startTopicId: '123e4567-e89b-12d3-a456-426614174001',
        endTopicId: '123e4567-e89b-12d3-a456-426614174002'
      };

      const response = await request(app)
        .post('/api/topics/shortest-path')
        .send(pathRequest)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('POST /api/topics', () => {
    it('should create a new topic as Admin', async () => {
      mockTopicStorage.createTopic.mockReturnValue(mockTopicResponse);

      const response = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validTopic)
        .expect(201);

      expect(response.body).toEqual(mockTopicResponse);
      expect(mockTopicStorage.createTopic).toHaveBeenCalledWith(validTopic);
    });

    it('should create a new topic as Editor', async () => {
      mockTopicStorage.createTopic.mockReturnValue(mockTopicResponse);

      const response = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(validTopic)
        .expect(201);

      expect(response.body).toEqual(mockTopicResponse);
      expect(mockTopicStorage.createTopic).toHaveBeenCalledWith(validTopic);
    });

    it('should return 403 for Viewer role', async () => {
      const response = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validTopic)
        .expect(403);

      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/topics')
        .send(validTopic)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should return 400 for invalid data', async () => {
      const invalidTopic = {
        name: '', // Empty name should be invalid
        parentTopicId: 'invalid-uuid'
      };

      const response = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidTopic)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteTopic = {
        content: 'Content without name',
        // Missing name
      };

      const response = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteTopic)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/topics/:id', () => {
    it('should update a topic as Admin', async () => {
      const updatedData = {
        name: 'Updated Topic Name',
        content: 'Updated content'
      };
      const updatedTopic = { ...mockTopicResponse, ...updatedData };
      
      mockTopicStorage.updateTopic.mockReturnValue(updatedTopic);

      const response = await request(app)
        .put(`/api/topics/${mockTopicResponse.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toEqual(updatedTopic);
      expect(mockTopicStorage.updateTopic).toHaveBeenCalledWith(
        mockTopicResponse.id,
        updatedData
      );
    });

    it('should update a topic as Editor', async () => {
      const updatedData = {
        name: 'Updated Topic Name',
        content: 'Updated content'
      };
      const updatedTopic = { ...mockTopicResponse, ...updatedData };
      
      mockTopicStorage.updateTopic.mockReturnValue(updatedTopic);

      const response = await request(app)
        .put(`/api/topics/${mockTopicResponse.id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toEqual(updatedTopic);
      expect(mockTopicStorage.updateTopic).toHaveBeenCalledWith(
        mockTopicResponse.id,
        updatedData
      );
    });

    it('should return 403 for Viewer role', async () => {
      const updatedData = {
        name: 'Updated Topic Name',
        content: 'Updated content'
      };

      const response = await request(app)
        .put(`/api/topics/${mockTopicResponse.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedData)
        .expect(403);

      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should return 401 for unauthenticated request', async () => {
      const updatedData = {
        name: 'Updated Topic Name',
        content: 'Updated content'
      };

      const response = await request(app)
        .put(`/api/topics/${mockTopicResponse.id}`)
        .send(updatedData)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should return 404 when updating non-existent topic', async () => {
      mockTopicStorage.updateTopic.mockImplementation(() => {
        throw new Error('Topic not found');
      });

      const validUuid = '123e4567-e89b-12d3-a456-426614174999';
      const response = await request(app)
        .put(`/api/topics/${validUuid}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/topics/:id', () => {
    it('should delete a topic as Admin', async () => {
      mockTopicStorage.deleteTopic.mockReturnValue(undefined);

      await request(app)
        .delete(`/api/topics/${mockTopicResponse.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      expect(mockTopicStorage.deleteTopic).toHaveBeenCalledWith(mockTopicResponse.id);
    });

    it('should return 403 for Editor role', async () => {
      const response = await request(app)
        .delete(`/api/topics/${mockTopicResponse.id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(403);

      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should return 403 for Viewer role', async () => {
      const response = await request(app)
        .delete(`/api/topics/${mockTopicResponse.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .delete(`/api/topics/${mockTopicResponse.id}`)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should return 404 when deleting non-existent topic', async () => {
      mockTopicStorage.deleteTopic.mockImplementation(() => {
        throw new Error('Topic not found');
      });

      const validUuid = '123e4567-e89b-12d3-a456-426614174999';
      const response = await request(app)
        .delete(`/api/topics/${validUuid}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
