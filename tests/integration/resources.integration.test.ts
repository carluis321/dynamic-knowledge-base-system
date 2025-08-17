import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import routes from '../../src/routes';
import { errorHandler, notFoundHandler } from '../../src/middlewares/errorHandler';
import { UserRole } from '../../src/core/types/user';

// Mock the resource storage
jest.mock('../../src/services/resources/resource_storage', () => ({
  getAllResources: jest.fn(),
  createResource: jest.fn(),
  updateResource: jest.fn(),
  getResourceById: jest.fn(),
  getResourcesByTopicId: jest.fn(),
  deleteResource: jest.fn(),
}));

// Mock JWT for testing
const JWT_SECRET = 'your-secret-key';
process.env.JWT_SECRET = JWT_SECRET;

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api', routes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe('Resources Integration Tests', () => {
  let app: express.Application;
  const mockResourceStorage = require('../../src/services/resources/resource_storage');

  // Helper function to generate JWT tokens for testing
  const generateToken = (role: UserRole, userId = 'test-user-id', email = 'test@example.com') => {
    return jwt.sign(
      { id: userId, email, role },
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

  const validResource = {
    topicId: '123e4567-e89b-12d3-a456-426614174001',
    url: 'https://example.com/resource',
    description: 'Test resource',
    type: 'article'
  };

  const mockResourceResponse = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    ...validResource,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  describe('GET /api/resources', () => {
    it('should return all resources for authenticated user', async () => {
      mockResourceStorage.getAllResources.mockReturnValue([mockResourceResponse]);

      const response = await request(app)
        .get('/api/resources')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toEqual([mockResourceResponse]);
      expect(mockResourceStorage.getAllResources).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/resources')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('GET /api/resources/:id', () => {
    it('should return resource by id for authenticated user', async () => {
      mockResourceStorage.getResourceById.mockReturnValue(mockResourceResponse);

      const response = await request(app)
        .get(`/api/resources/${mockResourceResponse.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toEqual(mockResourceResponse);
      expect(mockResourceStorage.getResourceById).toHaveBeenCalledWith(mockResourceResponse.id);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get(`/api/resources/${mockResourceResponse.id}`)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should return 404 when resource not found', async () => {
      mockResourceStorage.getResourceById.mockImplementation(() => {
        throw new Error('Resource not found');
      });

      const validUuid = '123e4567-e89b-12d3-a456-426614174999';
      const response = await request(app)
        .get(`/api/resources/${validUuid}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/resources/invalid-uuid')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/resources/topic/:topicId', () => {
    it('should return resources by topic id for authenticated user', async () => {
      mockResourceStorage.getResourcesByTopicId.mockReturnValue([mockResourceResponse]);

      const response = await request(app)
        .get(`/api/resources/topic/${validResource.topicId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toEqual([mockResourceResponse]);
      expect(mockResourceStorage.getResourcesByTopicId).toHaveBeenCalledWith(validResource.topicId);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get(`/api/resources/topic/${validResource.topicId}`)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('POST /api/resources', () => {
    it('should create a new resource as Admin', async () => {
      mockResourceStorage.createResource.mockReturnValue(mockResourceResponse);

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validResource)
        .expect(201);

      expect(response.body).toEqual(mockResourceResponse);
      expect(mockResourceStorage.createResource).toHaveBeenCalledWith(validResource);
    });

    it('should create a new resource as Editor', async () => {
      mockResourceStorage.createResource.mockReturnValue(mockResourceResponse);

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(validResource)
        .expect(201);

      expect(response.body).toEqual(mockResourceResponse);
      expect(mockResourceStorage.createResource).toHaveBeenCalledWith(validResource);
    });

    it('should return 403 for Viewer role', async () => {
      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validResource)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Required roles: Admin, Editor. Your role: Viewer');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/resources')
        .send(validResource)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should return 400 for invalid data', async () => {
      const invalidResource = {
        topicId: 'invalid-uuid',
        url: 'not-a-url',
        type: 'invalid-type'
      };

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidResource)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteResource = {
        url: 'https://example.com',
        // Missing topicId and type
      };

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteResource)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/resources/:id', () => {
    it('should update a resource as Admin', async () => {
      const updatedData = {
        url: 'https://updated-example.com',
        description: 'Updated description'
      };
      const updatedResource = { ...mockResourceResponse, ...updatedData };
      
      mockResourceStorage.updateResource.mockReturnValue(updatedResource);

      const response = await request(app)
        .put(`/api/resources/${mockResourceResponse.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toEqual(updatedResource);
      expect(mockResourceStorage.updateResource).toHaveBeenCalledWith(
        mockResourceResponse.id,
        updatedData
      );
    });

    it('should update a resource as Editor', async () => {
      const updatedData = {
        url: 'https://updated-example.com',
        description: 'Updated description'
      };
      const updatedResource = { ...mockResourceResponse, ...updatedData };
      
      mockResourceStorage.updateResource.mockReturnValue(updatedResource);

      const response = await request(app)
        .put(`/api/resources/${mockResourceResponse.id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toEqual(updatedResource);
      expect(mockResourceStorage.updateResource).toHaveBeenCalledWith(
        mockResourceResponse.id,
        updatedData
      );
    });

    it('should return 403 for Viewer role', async () => {
      const updatedData = {
        url: 'https://updated-example.com',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/resources/${mockResourceResponse.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedData)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Required roles: Admin, Editor. Your role: Viewer');
    });

    it('should return 401 for unauthenticated request', async () => {
      const updatedData = {
        url: 'https://updated-example.com',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/resources/${mockResourceResponse.id}`)
        .send(updatedData)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should return 404 when updating non-existent resource', async () => {
      mockResourceStorage.updateResource.mockImplementation(() => {
        throw new Error('Resource not found');
      });

      const validUuid = '123e4567-e89b-12d3-a456-426614174999';
      const response = await request(app)
        .put(`/api/resources/${validUuid}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ url: 'https://example.com' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/resources/:id', () => {
    it('should delete a resource as Admin', async () => {
      mockResourceStorage.deleteResource.mockReturnValue(undefined);

      await request(app)
        .delete(`/api/resources/${mockResourceResponse.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      expect(mockResourceStorage.deleteResource).toHaveBeenCalledWith(mockResourceResponse.id);
    });

    it('should return 403 for Editor role', async () => {
      const response = await request(app)
        .delete(`/api/resources/${mockResourceResponse.id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Required roles: Admin. Your role: Editor');
    });

    it('should return 403 for Viewer role', async () => {
      const response = await request(app)
        .delete(`/api/resources/${mockResourceResponse.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Required roles: Admin. Your role: Viewer');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .delete(`/api/resources/${mockResourceResponse.id}`)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should return 404 when deleting non-existent resource', async () => {
      mockResourceStorage.deleteResource.mockImplementation(() => {
        throw new Error('Resource not found');
      });

      const validUuid = '123e4567-e89b-12d3-a456-426614174999';
      const response = await request(app)
        .delete(`/api/resources/${validUuid}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
