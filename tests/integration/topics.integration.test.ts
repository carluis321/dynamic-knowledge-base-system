import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import routes from '../../src/routes';
import { errorHandler, notFoundHandler } from '../../src/middlewares/errorHandler';
import { UserRole } from '../../src/core/types/user';
import { getAllTopics } from '../../src/services/topics/topic_storage';


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

describe('Topics Integration Tests', () => {
  let app: express.Application;

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
      const response = await request(app)
        .get('/api/topics')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.length).toEqual(getAllTopics().length);
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
      const validUuid = 'b2c3d4e5-6f70-4b8c-8d9e-1f2a3b4c5d6e';
      const response = await request(app)
        .get(`/api/topics/${validUuid}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const compositedTopic = {
        "children": [
            {
                "children": [
                    {
                        "children": [
                            {
                                "children": [
                                    {
                                        "children": [],
                                        "parent": null,
                                        "id": "e6f7a8b9-8901-4c2d-9e3f-678901234567",
                                        "name": "Advanced Patterns",
                                        "content": "Matrix builds, dynamic workflows, and multi-repo strategies.",
                                        "parentTopicId": "d5e6f7a8-7890-4b1c-9d2e-5678f9012345",
                                        "version": 1,
                                        "createdAt": "2025-08-13T15:10:00.000Z",
                                        "updatedAt": "2025-08-13T15:10:00.000Z"
                                    }
                                ],
                                "parent": null,
                                "id": "d5e6f7a8-7890-4b1c-9d2e-5678f9012345",
                                "name": "Reusable Workflows",
                                "content": "Patterns for composing reusable CI workflows.",
                                "parentTopicId": "c4d5e6f7-6789-4a0b-9c1d-4567e8f90123",
                                "version": 1,
                                "createdAt": "2025-08-13T14:45:00.000Z",
                                "updatedAt": "2025-08-13T14:45:00.000Z"
                            }
                        ],
                        "parent": null,
                        "id": "c4d5e6f7-6789-4a0b-9c1d-4567e8f90123",
                        "name": "GitHub Actions",
                        "content": "Reusable workflows and actions marketplace.",
                        "parentTopicId": "07b8c9d0-ab15-4011-9c23-6e7f8091a2b3",
                        "version": 1,
                        "createdAt": "2025-08-13T14:15:00.000Z",
                        "updatedAt": "2025-08-13T14:15:00.000Z"
                    }
                ],
                "parent": null,
                "id": "07b8c9d0-ab15-4011-9c23-6e7f8091a2b3",
                "name": "CI/CD Pipelines",
                "content": "Designing pipelines, testing stages, and artifact management.",
                "parentTopicId": "b2c3d4e5-6f70-4b8c-8d9e-1f2a3b4c5d6e",
                "version": 2,
                "createdAt": "2025-08-13T13:45:00.000Z",
                "updatedAt": "2025-08-14T13:45:00.000Z"
            },
            {
                "children": [
                    {
                        "children": [
                            {
                                "children": [],
                                "parent": null,
                                "id": "7f8e9d0c-9012-4e3f-9a4b-6789c0d1e2f3",
                                "name": "Charts Best Practices",
                                "content": "Structuring charts and managing values across environments.",
                                "parentTopicId": "3a4b5c6d-7e8f-4a9b-9c0d-2e3f4a5b6c7d",
                                "version": 1,
                                "createdAt": "2025-08-14T11:45:00.000Z",
                                "updatedAt": "2025-08-14T11:45:00.000Z"
                            }
                        ],
                        "parent": null,
                        "id": "3a4b5c6d-7e8f-4a9b-9c0d-2e3f4a5b6c7d",
                        "name": "Helm",
                        "content": "Package manager for Kubernetes; charts and templating.",
                        "parentTopicId": "29d0e1f2-cd37-4333-9e45-8091a2b3c4d5",
                        "version": 1,
                        "createdAt": "2025-08-14T11:15:00.000Z",
                        "updatedAt": "2025-08-14T11:15:00.000Z"
                    }
                ],
                "parent": null,
                "id": "29d0e1f2-cd37-4333-9e45-8091a2b3c4d5",
                "name": "Kubernetes",
                "content": "Cluster concepts, deployments, services, and RBAC.",
                "parentTopicId": "b2c3d4e5-6f70-4b8c-8d9e-1f2a3b4c5d6e",
                "version": 1,
                "createdAt": "2025-08-14T10:30:00.000Z",
                "updatedAt": "2025-08-14T10:30:00.000Z"
            }
        ],
        "parent": null,
        "id": "b2c3d4e5-6f70-4b8c-8d9e-1f2a3b4c5d6e",
        "name": "DevOps",
        "content": "Practices for CI/CD, infrastructure as code and monitoring. (changed in version 4)",
        "parentTopicId": null,
        "version": 4,
        "createdAt": "2025-08-11T07:30:00.000Z",
        "updatedAt": "2025-08-14T07:30:00.000Z"
    }

      expect(response.body).toEqual(compositedTopic);
    });

    it('should return 401 for unauthenticated request', async () => {
      const validUuid = 'b2c3d4e5-6f70-4b8c-8d9e-1f2a3b4c5d6e';
      const response = await request(app)
        .get(`/api/topics/${validUuid}`)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should return 404 when topic not found', async () => {
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
        startTopicId: 'e5f6a7b8-92a3-4ebf-9a01-4c5d6e7f8091',
        endTopicId: 'b7c8d9e0-1a2b-4c3d-8e9f-0a1b2c3d4e5f'
      };

      const path = [
        "e5f6a7b8-92a3-4ebf-9a01-4c5d6e7f8091",
        "f6a7b8c9-0ab4-4fc0-8b12-5d6e7f8091a2",
        "b7c8d9e0-1a2b-4c3d-8e9f-0a1b2c3d4e5f"
    ]

      const response = await request(app)
        .post('/api/topics/shortest-path')
        .set('Authorization', `Bearer ${userToken}`)
        .send(pathRequest)
        .expect(200);

      expect(response.body).toEqual({ path });
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
      const response = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validTopic)
        .expect(201);

      expect(response.body.name).toBe(validTopic.name);
      expect(response.body.content).toBe(validTopic.content);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create a new topic as Editor', async () => {
      const response = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(validTopic)
        .expect(201);

      expect(response.body.name).toBe(validTopic.name);
      expect(response.body.content).toBe(validTopic.content);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 403 for Viewer role', async () => {
      const response = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validTopic)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Required roles: Admin, Editor. Your role: Viewer');
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

      const validUuid = '9f1b2c3d-4a5e-4f6a-8b7c-1d2e3f4a5b6c';

      const response = await request(app)
        .put(`/api/topics/${validUuid}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.name).toBe(updatedTopic.name);
      expect(response.body.content).toBe(updatedTopic.content);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should update a topic as Editor', async () => {
      const updatedData = {
        name: 'Updated Topic Name',
        content: 'Updated content'
      };
      const updatedTopic = { ...mockTopicResponse, ...updatedData };

      const validUuid = 'c3d4e5f6-7081-4c9d-9eaf-2a3b4c5d6e7f';

      const response = await request(app)
        .put(`/api/topics/${validUuid}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.name).toBe(updatedTopic.name);
      expect(response.body.content).toBe(updatedTopic.content);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 403 for Viewer role', async () => {
      const updatedData = {
        name: 'Updated Topic Name',
        content: 'Updated content'
      };

      const validUuid = 'c3d4e5f6-7081-4c9d-9eaf-2a3b4c5d6e7f';

      const response = await request(app)
        .put(`/api/topics/${validUuid}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedData)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Required roles: Admin, Editor. Your role: Viewer');
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
      const validUuid = 'c3d4e5f6-7081-4c9d-9eaf-2a3b4c5d6e7f';
      await request(app)
        .delete(`/api/topics/${validUuid}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('should return 403 for Editor role', async () => {
      const response = await request(app)
        .delete(`/api/topics/${mockTopicResponse.id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Required roles: Admin. Your role: Editor');
    });

    it('should return 403 for Viewer role', async () => {
      const response = await request(app)
        .delete(`/api/topics/${mockTopicResponse.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Required roles: Admin. Your role: Viewer');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .delete(`/api/topics/${mockTopicResponse.id}`)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should return 404 when deleting non-existent topic', async () => {
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
