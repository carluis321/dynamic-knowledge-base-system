import { 
  getAllTopics, 
  createTopic, 
  getTopicById, 
  updateTopic, 
  getTopicsByParentId, 
  deleteTopicsByIds 
} from '../../../src/services/topics/topic_storage';
import type { ITopic } from '../../../src/core/types/topic';

// Mock uuid to return predictable values
let mockCounter = 0;
jest.mock('uuid', () => ({
  v4: jest.fn(() => `mocked-uuid-${++mockCounter}`)
}));

describe('Topic Storage', () => {
  let originalTopics: ITopic[];

  beforeEach(() => {
    // Reset topics to initial state before each test
    jest.clearAllMocks();
    mockCounter = 0; // Reset counter for each test
    
    // Store original topics to restore later
    originalTopics = getAllTopics();
  });

  afterEach(() => {
    // Clean up any topics created during tests
    const currentTopics = getAllTopics();
    const testTopicIds = new Set<string>();
    
    currentTopics.forEach(topic => {
      if (topic.id?.startsWith('mocked-uuid-') || 
          topic.name?.includes('Test') ||
          topic.id?.startsWith('test-')) {
        testTopicIds.add(topic.id!);
      }
    });
    
    if (testTopicIds.size > 0) {
      try {
        deleteTopicsByIds(Array.from(testTopicIds));
      } catch (error) {
        // Topics might already be deleted
      }
    }
  });

  describe('getAllTopics', () => {
    it('should return all topics', () => {
      const topics = getAllTopics();
      
      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBeGreaterThan(0);
      expect(topics[0]).toHaveProperty('id');
      expect(topics[0]).toHaveProperty('name');
      expect(topics[0]).toHaveProperty('content');
    });
  });

  describe('createTopic', () => {
    it('should create a new topic with generated ID', () => {
      const topicData = {
        name: 'Test Topic',
        content: 'Test content',
        parentTopicId: null,
        version: 1
      };

      const createdTopic = createTopic(topicData);

      expect(createdTopic).toMatchObject({
        id: 'mocked-uuid-1',
        name: 'Test Topic',
        content: 'Test content',
        version: 1,
        parentTopicId: null
      });
      expect(createdTopic.createdAt).toBeInstanceOf(Date);
      expect(createdTopic.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a topic with provided ID', () => {
      const topicData = {
        id: 'custom-id-123',
        name: 'Test Topic with ID',
        content: 'Test content',
        parentTopicId: null,
        version: 1
      };

      const createdTopic = createTopic(topicData);

      expect(createdTopic.id).toBe('custom-id-123');
      expect(createdTopic.name).toBe('Test Topic with ID');
    });

    it('should create a topic with parent', () => {
      const parentTopicData = {
        name: 'Parent Topic',
        content: 'Parent content',
        parentTopicId: null,
        version: 1
      };

      const parentTopic = createTopic(parentTopicData);

      const childTopicData = {
        name: 'Child Topic',
        content: 'Child content',
        parentTopicId: parentTopic.id!,
        version: 1
      };

      const childTopic = createTopic(childTopicData);

      expect(childTopic.parentTopicId).toBe(parentTopic.id);
      expect(childTopic.name).toBe('Child Topic');
    });
  });

  describe('getTopicById', () => {
    it('should return the latest version of a topic', () => {
      // Create multiple versions of the same topic
      const topicId = 'test-topic-versions';
      
      createTopic({
        id: topicId,
        name: 'Test Topic',
        content: 'Version 1',
        version: 1,
        parentTopicId: null
      });

      createTopic({
        id: topicId,
        name: 'Test Topic',
        content: 'Version 2',
        version: 2,
        parentTopicId: null
      });

      createTopic({
        id: topicId,
        name: 'Test Topic',
        content: 'Version 3',
        version: 3,
        parentTopicId: null
      });

      const topic = getTopicById(topicId);

      expect(topic.version).toBe(3);
      expect(topic.content).toBe('Version 3');
      expect(topic.id).toBe(topicId);
    });

    it('should throw error when topic not found', () => {
      expect(() => {
        getTopicById('non-existent-id');
      }).toThrow('Topic with id non-existent-id not found');
    });

    it('should return existing topic from seed data', () => {
      // Use an ID from the seed data
      const existingTopicId = 'a1b2c3d4-5e6f-4a7b-9c8d-0e1f2a3b4c5d';
      
      const topic = getTopicById(existingTopicId);

      expect(topic).toBeDefined();
      expect(topic.id).toBe(existingTopicId);
      expect(topic.name).toBe('Databases');
    });
  });

  describe('updateTopic', () => {
    it('should add updated topic to storage', () => {
      const originalTopic = createTopic({
        name: 'Original Topic',
        content: 'Original content',
        version: 1,
        parentTopicId: null
      });

      const updatedTopic: ITopic = {
        ...originalTopic,
        content: 'Updated content',
        version: 2,
        updatedAt: new Date()
      };

      const result = updateTopic(updatedTopic);

      expect(result).toEqual(updatedTopic);
      
      // Verify the latest version is returned
      const latestTopic = getTopicById(originalTopic.id!);
      expect(latestTopic.version).toBe(2);
      expect(latestTopic.content).toBe('Updated content');
    });
  });

  describe('getTopicsByParentId', () => {
    it('should return children topics with latest versions', () => {
      const parentId = 'parent-topic-test';
      
      // Create parent topic
      createTopic({
        id: parentId,
        name: 'Parent Topic',
        content: 'Parent content',
        version: 1,
        parentTopicId: null
      });

      // Create child topics with multiple versions
      const child1Id = 'child-1';
      const child2Id = 'child-2';

      createTopic({
        id: child1Id,
        name: 'Child 1',
        content: 'Child 1 v1',
        version: 1,
        parentTopicId: parentId
      });

      createTopic({
        id: child1Id,
        name: 'Child 1',
        content: 'Child 1 v2',
        version: 2,
        parentTopicId: parentId
      });

      createTopic({
        id: child2Id,
        name: 'Child 2',
        content: 'Child 2 v1',
        version: 1,
        parentTopicId: parentId
      });

      const children = getTopicsByParentId(parentId);

      expect(children).toHaveLength(2);
      
      const child1 = children.find(c => c.id === child1Id);
      const child2 = children.find(c => c.id === child2Id);

      expect(child1?.version).toBe(2);
      expect(child1?.content).toBe('Child 1 v2');
      expect(child2?.version).toBe(1);
      expect(child2?.content).toBe('Child 2 v1');
    });

    it('should return empty array when no children exist', () => {
      const children = getTopicsByParentId('non-existent-parent');
      
      expect(children).toEqual([]);
    });

    it('should return children from seed data', () => {
      // Use existing parent from seed data
      const parentId = 'a1b2c3d4-5e6f-4a7b-9c8d-0e1f2a3b4c5d'; // Databases topic
      
      const children = getTopicsByParentId(parentId);

      expect(children.length).toBeGreaterThan(0);
      expect(children.every(child => child.parentTopicId === parentId)).toBe(true);
    });
  });

  describe('deleteTopicsByIds', () => {
    it('should delete topics with specified IDs', () => {
      const topic1 = createTopic({
        name: 'Topic to Delete 1',
        content: 'Content 1',
        version: 1,
        parentTopicId: null
      });

      const topic2 = createTopic({
        name: 'Topic to Delete 2',
        content: 'Content 2',
        version: 1,
        parentTopicId: null
      });

      const topic3 = createTopic({
        name: 'Topic to Keep',
        content: 'Content 3',
        version: 1,
        parentTopicId: null
      });

      // Verify topics were created
      expect(getTopicById(topic1.id!)).toBeDefined();
      expect(getTopicById(topic2.id!)).toBeDefined();
      expect(getTopicById(topic3.id!)).toBeDefined();

      deleteTopicsByIds([topic1.id!, topic2.id!]);

      const remainingTopics = getAllTopics();
      
      // Verify deleted topics are no longer found
      expect(() => getTopicById(topic1.id!)).toThrow();
      expect(() => getTopicById(topic2.id!)).toThrow();
      
      // Verify kept topic still exists
      expect(getTopicById(topic3.id!)).toBeDefined();
      expect(remainingTopics.find(t => t.id === topic3.id)).toBeDefined();
    });

    it('should handle empty array', () => {
      const initialCount = getAllTopics().length;
      
      deleteTopicsByIds([]);
      
      expect(getAllTopics().length).toBe(initialCount);
    });

    it('should handle non-existent IDs gracefully', () => {
      const initialCount = getAllTopics().length;
      
      deleteTopicsByIds(['non-existent-1', 'non-existent-2']);
      
      expect(getAllTopics().length).toBe(initialCount);
    });
  });
});
