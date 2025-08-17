import { 
  getAllResources, 
  createResource, 
  getResourceById, 
  getResourcesByTopicId, 
  updateResource, 
  deleteResource, 
  deleteResourcesByTopicId 
} from '../../../src/services/resources/resource_storage';
import type { ResourceType } from '../../../src/core/types/resource';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-1234')
}));

describe('Resource Storage', () => {
  let initialResourceCount: number;

  beforeEach(() => {
    jest.clearAllMocks();
    initialResourceCount = getAllResources().length;
  });

  afterEach(() => {
    // Clean up any resources created during tests
    const currentResources = getAllResources();
    const testResources = currentResources.filter(resource => 
      resource.id === 'mocked-uuid-1234' || 
      resource.description?.includes('Test') ||
      resource.id?.startsWith('test-')
    );
    
    testResources.forEach(resource => {
      try {
        deleteResource(resource.id!);
      } catch (error) {
        // Resource might already be deleted
      }
    });
  });

  describe('getAllResources', () => {
    it('should return all resources', () => {
      const resources = getAllResources();
      
      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeGreaterThan(0);
      expect(resources[0]).toHaveProperty('id');
      expect(resources[0]).toHaveProperty('topicId');
      expect(resources[0]).toHaveProperty('url');
      expect(resources[0]).toHaveProperty('type');
    });

    it('should return resources with correct structure', () => {
      const resources = getAllResources();
      
      resources.forEach(resource => {
        expect(resource).toHaveProperty('id');
        expect(resource).toHaveProperty('topicId');
        expect(resource).toHaveProperty('url');
        expect(resource).toHaveProperty('description');
        expect(resource).toHaveProperty('type');
        expect(resource).toHaveProperty('createdAt');
        expect(resource).toHaveProperty('updatedAt');
        expect(resource.createdAt).toBeInstanceOf(Date);
        expect(resource.updatedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('createResource', () => {
    it('should create a new resource with generated ID', () => {
      const resourceData = {
        topicId: 'test-topic-123',
        url: 'https://test.example.com',
        description: 'Test Resource',
        type: 'article' as ResourceType
      };

      const createdResource = createResource(resourceData);

      expect(createdResource).toMatchObject({
        id: 'mocked-uuid-1234',
        topicId: 'test-topic-123',
        url: 'https://test.example.com',
        description: 'Test Resource',
        type: 'article' as ResourceType
      });
      expect(createdResource.createdAt).toBeInstanceOf(Date);
      expect(createdResource.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a resource with provided ID', () => {
      const resourceData = {
        id: 'test-resource-123',
        topicId: 'test-topic-123',
        url: 'https://test.example.com',
        description: 'Test Resource with ID',
        type: 'video' as ResourceType
      };

      const createdResource = createResource(resourceData);

      expect(createdResource.id).toBe('test-resource-123');
      expect(createdResource.type).toBe('video');
      expect(createdResource.description).toBe('Test Resource with ID');
    });

    it('should add resource to storage', () => {
      const initialCount = getAllResources().length;
      
      const resourceData = {
        topicId: 'test-topic-123',
        url: 'https://test.example.com',
        description: 'Test Resource',
        type: 'pdf' as ResourceType
      };

      createResource(resourceData);

      const finalCount = getAllResources().length;
      expect(finalCount).toBe(initialCount + 1);
    });
  });

  describe('getResourceById', () => {
    it('should return resource when found', () => {
      const resourceData = {
        id: 'test-get-resource',
        topicId: 'test-topic-123',
        url: 'https://test.example.com',
        description: 'Test Get Resource',
        type: 'article' as ResourceType
      };

      const createdResource = createResource(resourceData);
      const foundResource = getResourceById('test-get-resource');

      expect(foundResource).toEqual(createdResource);
    });

    it('should throw error when resource not found', () => {
      expect(() => {
        getResourceById('non-existent-id');
      }).toThrow('Resource with id non-existent-id not found');
    });

    it('should return existing resource from seed data', () => {
      const existingResourceId = 'res-001';
      
      const resource = getResourceById(existingResourceId);

      expect(resource).toBeDefined();
      expect(resource.id).toBe(existingResourceId);
      expect(resource.url).toBe('https://www.postgresql.org/docs/');
    });
  });

  describe('getResourcesByTopicId', () => {
    it('should return resources for specific topic', () => {
      const topicId = 'test-topic-resources';
      
      // Create multiple resources for the same topic
      createResource({
        topicId,
        url: 'https://test1.example.com',
        description: 'Test Resource 1',
        type: 'article' as ResourceType
      });

      createResource({
        topicId,
        url: 'https://test2.example.com',
        description: 'Test Resource 2',
        type: 'video' as ResourceType
      });

      // Create resource for different topic
      createResource({
        topicId: 'different-topic',
        url: 'https://different.example.com',
        description: 'Different Resource',
        type: 'pdf' as ResourceType
      });

      const topicResources = getResourcesByTopicId(topicId);

      expect(topicResources).toHaveLength(2);
      expect(topicResources.every(r => r.topicId === topicId)).toBe(true);
      expect(topicResources.some(r => r.description === 'Test Resource 1')).toBe(true);
      expect(topicResources.some(r => r.description === 'Test Resource 2')).toBe(true);
    });

    it('should return empty array when no resources found for topic', () => {
      const resources = getResourcesByTopicId('non-existent-topic');
      
      expect(resources).toEqual([]);
    });

    it('should return resources from seed data', () => {
      const existingTopicId = 'a1b2c3d4-5e6f-4a7b-9c8d-0e1f2a3b4c5d';
      
      const resources = getResourcesByTopicId(existingTopicId);

      expect(resources.length).toBeGreaterThan(0);
      expect(resources.every(r => r.topicId === existingTopicId)).toBe(true);
    });
  });

  describe('updateResource', () => {
    it('should update existing resource', async () => {
      const resourceData = {
        id: 'test-update-resource',
        topicId: 'test-topic-123',
        url: 'https://original.example.com',
        description: 'Original Description',
        type: 'article' as ResourceType
      };

      const createdResource = createResource(resourceData);
      const originalUpdatedAt = createdResource.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const updates = {
        description: 'Updated Description',
        url: 'https://updated.example.com'
      };

      const updatedResource = updateResource('test-update-resource', updates);

      expect(updatedResource.id).toBe('test-update-resource');
      expect(updatedResource.description).toBe('Updated Description');
      expect(updatedResource.url).toBe('https://updated.example.com');
      expect(updatedResource.topicId).toBe('test-topic-123'); // Should remain unchanged
      expect(updatedResource.type).toBe('article'); // Should remain unchanged
      expect(updatedResource.updatedAt!.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt!.getTime());
    });

    it('should throw error when resource not found', () => {
      expect(() => {
        updateResource('non-existent-id', { description: 'New Description' });
      }).toThrow('Resource with id non-existent-id not found');
    });

    it('should preserve ID when updating', () => {
      const resourceData = {
        id: 'test-preserve-id',
        topicId: 'test-topic-123',
        url: 'https://test.example.com',
        description: 'Test Resource',
        type: 'article' as ResourceType
      };

      createResource(resourceData);

      const updates = {
        id: 'different-id', // This should be ignored
        description: 'Updated Description'
      };

      const updatedResource = updateResource('test-preserve-id', updates);

      expect(updatedResource.id).toBe('test-preserve-id');
      expect(updatedResource.description).toBe('Updated Description');
    });
  });

  describe('deleteResource', () => {
    it('should delete existing resource', () => {
      const resourceData = {
        id: 'test-delete-resource',
        topicId: 'test-topic-123',
        url: 'https://test.example.com',
        description: 'Test Delete Resource',
        type: 'article' as ResourceType
      };

      createResource(resourceData);
      const initialCount = getAllResources().length;

      deleteResource('test-delete-resource');

      const finalCount = getAllResources().length;
      expect(finalCount).toBe(initialCount - 1);

      expect(() => {
        getResourceById('test-delete-resource');
      }).toThrow('Resource with id test-delete-resource not found');
    });

    it('should throw error when resource not found', () => {
      expect(() => {
        deleteResource('non-existent-id');
      }).toThrow('Resource with id non-existent-id not found');
    });
  });

  describe('deleteResourcesByTopicId', () => {
    it('should delete all resources for specific topic', () => {
      const topicId = 'test-topic-delete-all';
      
      // Create multiple resources for the same topic
      createResource({
        topicId,
        url: 'https://test1.example.com',
        description: 'Test Resource 1',
        type: 'article' as ResourceType
      });

      createResource({
        topicId,
        url: 'https://test2.example.com',
        description: 'Test Resource 2',
        type: 'video' as ResourceType
      });

      // Create resource for different topic
      createResource({
        topicId: 'different-topic',
        url: 'https://different.example.com',
        description: 'Different Resource',
        type: 'pdf' as ResourceType
      });

      const initialCount = getAllResources().length;
      const topicResourcesCount = getResourcesByTopicId(topicId).length;

      deleteResourcesByTopicId(topicId);

      const finalCount = getAllResources().length;
      expect(finalCount).toBe(initialCount - topicResourcesCount);

      const remainingTopicResources = getResourcesByTopicId(topicId);
      expect(remainingTopicResources).toHaveLength(0);

      // Verify other topic resources still exist
      const differentTopicResources = getResourcesByTopicId('different-topic');
      expect(differentTopicResources).toHaveLength(1);
    });

    it('should handle non-existent topic gracefully', () => {
      const initialCount = getAllResources().length;
      
      deleteResourcesByTopicId('non-existent-topic');
      
      const finalCount = getAllResources().length;
      expect(finalCount).toBe(initialCount);
    });
  });
});
