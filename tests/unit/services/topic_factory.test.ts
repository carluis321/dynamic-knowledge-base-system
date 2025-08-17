import { TopicFactory } from '../../../src/services/topics/factory/topic_factory';
import { Topic } from '../../../src/services/topics/topic';
import { ITopic } from '../../../src/core/types/topic';

// Mock uuid to return predictable values
let mockCounter = 0;
jest.mock('uuid', () => ({
  v4: jest.fn(() => `factory-test-uuid-${++mockCounter}`)
}));

describe('TopicFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCounter = 0; // Reset counter for each test
  });

  describe('create', () => {
    it('should create a topic with only required parameters', () => {
      const name = 'Test Topic';
      
      const topic = TopicFactory.create(name);
      
      expect(topic).toBeInstanceOf(Topic);
      expect(topic.name).toBe(name);
      expect(topic.version).toBe(1);
      expect(topic.content).toBeUndefined();
      expect(topic.parentTopicId).toBeNull();
      expect(topic.id).toBeNull();
      expect(topic.createdAt).toBeInstanceOf(Date);
      expect(topic.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a topic with name and content', () => {
      const name = 'Test Topic';
      const content = 'Test content for the topic';
      
      const topic = TopicFactory.create(name, content);
      
      expect(topic).toBeInstanceOf(Topic);
      expect(topic.name).toBe(name);
      expect(topic.content).toBe(content);
      expect(topic.version).toBe(1);
      expect(topic.parentTopicId).toBeNull();
      expect(topic.id).toBeNull();
    });

    it('should create a topic with parent topic ID', () => {
      const name = 'Child Topic';
      const content = 'Child topic content';
      const parentTopicId = 'parent-topic-123';
      
      const topic = TopicFactory.create(name, content, parentTopicId);
      
      expect(topic).toBeInstanceOf(Topic);
      expect(topic.name).toBe(name);
      expect(topic.content).toBe(content);
      expect(topic.parentTopicId).toBe(parentTopicId);
      expect(topic.version).toBe(1);
      expect(topic.id).toBeNull();
    });

    it('should create a topic with explicit null parent', () => {
      const name = 'Root Topic';
      const content = 'Root topic content';
      
      const topic = TopicFactory.create(name, content, null);
      
      expect(topic).toBeInstanceOf(Topic);
      expect(topic.name).toBe(name);
      expect(topic.content).toBe(content);
      expect(topic.parentTopicId).toBeNull();
      expect(topic.version).toBe(1);
      expect(topic.id).toBeNull();
    });

    it('should create a topic with custom version', () => {
      const name = 'Versioned Topic';
      const content = 'Versioned content';
      const parentTopicId = 'parent-123';
      const version = 5;
      
      const topic = TopicFactory.create(name, content, parentTopicId, version);
      
      expect(topic).toBeInstanceOf(Topic);
      expect(topic.name).toBe(name);
      expect(topic.content).toBe(content);
      expect(topic.parentTopicId).toBe(parentTopicId);
      expect(topic.version).toBe(version);
      expect(topic.id).toBeNull();
    });

    it('should create a topic with custom ID', () => {
      const name = 'Custom ID Topic';
      const content = 'Custom ID content';
      const parentTopicId = 'parent-456';
      const version = 2;
      const customId = 'custom-topic-id-789';
      
      const topic = TopicFactory.create(name, content, parentTopicId, version, customId);
      
      expect(topic).toBeInstanceOf(Topic);
      expect(topic.name).toBe(name);
      expect(topic.content).toBe(content);
      expect(topic.parentTopicId).toBe(parentTopicId);
      expect(topic.version).toBe(version);
      expect(topic.id).toBe(customId);
    });

    it('should create a topic with all parameters', () => {
      const name = 'Complete Topic';
      const content = 'Complete topic content';
      const parentTopicId = 'parent-complete';
      const version = 3;
      const id = 'complete-topic-id';
      
      const topic = TopicFactory.create(name, content, parentTopicId, version, id);
      
      expect(topic).toBeInstanceOf(Topic);
      expect(topic.name).toBe(name);
      expect(topic.content).toBe(content);
      expect(topic.parentTopicId).toBe(parentTopicId);
      expect(topic.version).toBe(version);
      expect(topic.id).toBe(id);
      expect(topic.createdAt).toBeInstanceOf(Date);
      expect(topic.updatedAt).toBeInstanceOf(Date);
    });

    it('should create topic with default version when version is 0', () => {
      const name = 'Zero Version Topic';
      
      const topic = TopicFactory.create(name, undefined, null, 0);
      
      expect(topic).toBeInstanceOf(Topic);
      expect(topic.name).toBe(name);
      expect(topic.version).toBe(1); // Should default to 1 in TopicBase constructor
    });

    it('should handle undefined content parameter', () => {
      const name = 'No Content Topic';
      
      const topic = TopicFactory.create(name, undefined);
      
      expect(topic).toBeInstanceOf(Topic);
      expect(topic.name).toBe(name);
      expect(topic.content).toBeUndefined();
      expect(topic.version).toBe(1);
    });

    it('should handle empty string content', () => {
      const name = 'Empty Content Topic';
      const content = '';
      
      const topic = TopicFactory.create(name, content);
      
      expect(topic).toBeInstanceOf(Topic);
      expect(topic.name).toBe(name);
      expect(topic.content).toBe('');
      expect(topic.version).toBe(1);
    });

    it('should create multiple topics with different properties', () => {
      const topic1 = TopicFactory.create('Topic 1');
      const topic2 = TopicFactory.create('Topic 2', 'Content 2');
      const topic3 = TopicFactory.create('Topic 3', 'Content 3', 'parent-123', 2, 'custom-id');
      
      expect(topic1.name).toBe('Topic 1');
      expect(topic1.content).toBeUndefined();
      expect(topic1.version).toBe(1);
      
      expect(topic2.name).toBe('Topic 2');
      expect(topic2.content).toBe('Content 2');
      expect(topic2.version).toBe(1);
      
      expect(topic3.name).toBe('Topic 3');
      expect(topic3.content).toBe('Content 3');
      expect(topic3.parentTopicId).toBe('parent-123');
      expect(topic3.version).toBe(2);
      expect(topic3.id).toBe('custom-id');
    });

    it('should create topics that implement ITopic interface', () => {
      const topic = TopicFactory.create('Interface Test Topic');
      
      // Verify it implements ITopic interface
      expect(topic).toHaveProperty('id');
      expect(topic).toHaveProperty('name');
      expect(topic).toHaveProperty('content');
      expect(topic).toHaveProperty('createdAt');
      expect(topic).toHaveProperty('updatedAt');
      expect(topic).toHaveProperty('version');
      expect(topic).toHaveProperty('parentTopicId');
      
      // Verify types
      expect(typeof topic.name).toBe('string');
      expect(topic.createdAt).toBeInstanceOf(Date);
      expect(topic.updatedAt).toBeInstanceOf(Date);
    });

    it('should create topics with timestamps', () => {
      const beforeCreation = new Date();
      
      const topic = TopicFactory.create('Timestamp Test');
      
      const afterCreation = new Date();
      
      expect(topic.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(topic.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
      expect(topic.updatedAt!.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(topic.updatedAt!.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('Factory Pattern Implementation', () => {
    it('should act as a static factory method', () => {
      // Verify TopicFactory.create is a static method
      expect(typeof TopicFactory.create).toBe('function');
      
      // Verify we can call it without instantiating TopicFactory
      const topic = TopicFactory.create('Static Test');
      expect(topic).toBeInstanceOf(Topic);
    });

    it('should encapsulate object creation logic', () => {
      const name = 'Encapsulation Test';
      const content = 'Test content';
      
      // The factory should handle the complexity of creating a Topic
      const topic = TopicFactory.create(name, content);
      
      // Verify the factory properly initialized all properties
      expect(topic.name).toBe(name);
      expect(topic.content).toBe(content);
      expect(topic.createdAt).toBeDefined();
      expect(topic.updatedAt).toBeDefined();
      expect(topic.version).toBeDefined();
    });

    it('should provide a consistent interface for topic creation', () => {
      // Test different ways to create topics through the same interface
      const basicTopic = TopicFactory.create('Basic');
      const detailedTopic = TopicFactory.create('Detailed', 'Content', 'parent', 2, 'id');
      
      // Both should be Topic instances despite different parameters
      expect(basicTopic).toBeInstanceOf(Topic);
      expect(detailedTopic).toBeInstanceOf(Topic);
      
      // Both should implement the same interface
      expect(basicTopic.constructor).toBe(detailedTopic.constructor);
    });
  });
});
