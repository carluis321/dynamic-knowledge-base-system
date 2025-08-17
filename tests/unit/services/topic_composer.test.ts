import { compositeTopic } from '../../../src/services/topics/composite/topic_composer';
import { TopicNode } from '../../../src/services/topics/composite/topic_node';
import { getTopicsByParentId } from '../../../src/services/topics/topic_storage';
import type { ITopic } from '../../../src/core/types/topic';

// Mock the topic_storage module
jest.mock('../../../src/services/topics/topic_storage', () => ({
  getTopicsByParentId: jest.fn()
}));

const mockGetTopicsByParentId = getTopicsByParentId as jest.MockedFunction<typeof getTopicsByParentId>;

describe('Topic Composer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('compositeTopic', () => {
    it('should create a single node when topic has no children', () => {
      const topic: ITopic = {
        id: 'topic-1',
        name: 'Root Topic',
        content: 'Root content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetTopicsByParentId.mockReturnValue([]);

      const result = compositeTopic(topic);

      expect(result).toBeInstanceOf(TopicNode);
      expect(result.id).toBe(topic.id);
      expect(result.name).toBe(topic.name);
      expect(result.content).toBe(topic.content);
      expect(mockGetTopicsByParentId).toHaveBeenCalledWith('topic-1');
    });

    it('should create a composite structure with children', () => {
      const parentTopic: ITopic = {
        id: 'parent-1',
        name: 'Parent Topic',
        content: 'Parent content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const childTopic1: ITopic = {
        id: 'child-1',
        name: 'Child Topic 1',
        content: 'Child content 1',
        version: 1,
        parentTopicId: 'parent-1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const childTopic2: ITopic = {
        id: 'child-2',
        name: 'Child Topic 2',
        content: 'Child content 2',
        version: 1,
        parentTopicId: 'parent-1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetTopicsByParentId
        .mockReturnValueOnce([childTopic1, childTopic2]) // For parent
        .mockReturnValueOnce([]) // For child-1
        .mockReturnValueOnce([]); // For child-2

      const result = compositeTopic(parentTopic);

      expect(result).toBeInstanceOf(TopicNode);
      expect(result.id).toBe(parentTopic.id);
      expect(result.name).toBe(parentTopic.name);
      expect(result.content).toBe(parentTopic.content);
      expect(mockGetTopicsByParentId).toHaveBeenCalledTimes(3);
      expect(mockGetTopicsByParentId).toHaveBeenCalledWith('parent-1');
      expect(mockGetTopicsByParentId).toHaveBeenCalledWith('child-1');
      expect(mockGetTopicsByParentId).toHaveBeenCalledWith('child-2');
    });

    it('should create a deep nested structure', () => {
      const rootTopic: ITopic = {
        id: 'root',
        name: 'Root',
        content: 'Root content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const level1Topic: ITopic = {
        id: 'level1',
        name: 'Level 1',
        content: 'Level 1 content',
        version: 1,
        parentTopicId: 'root',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const level2Topic: ITopic = {
        id: 'level2',
        name: 'Level 2',
        content: 'Level 2 content',
        version: 1,
        parentTopicId: 'level1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetTopicsByParentId
        .mockReturnValueOnce([level1Topic]) // For root
        .mockReturnValueOnce([level2Topic]) // For level1
        .mockReturnValueOnce([]); // For level2

      const result = compositeTopic(rootTopic);

      expect(result).toBeInstanceOf(TopicNode);
      expect(result.id).toBe(rootTopic.id);
      expect(result.name).toBe(rootTopic.name);
      expect(result.content).toBe(rootTopic.content);
      expect(mockGetTopicsByParentId).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple children at different levels', () => {
      const rootTopic: ITopic = {
        id: 'root',
        name: 'Root',
        content: 'Root content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const child1: ITopic = {
        id: 'child1',
        name: 'Child 1',
        content: 'Child 1 content',
        version: 1,
        parentTopicId: 'root',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const child2: ITopic = {
        id: 'child2',
        name: 'Child 2',
        content: 'Child 2 content',
        version: 1,
        parentTopicId: 'root',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const grandchild1: ITopic = {
        id: 'grandchild1',
        name: 'Grandchild 1',
        content: 'Grandchild 1 content',
        version: 1,
        parentTopicId: 'child1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetTopicsByParentId
        .mockReturnValueOnce([child1, child2]) // For root
        .mockReturnValueOnce([grandchild1]) // For child1
        .mockReturnValueOnce([]) // For grandchild1
        .mockReturnValueOnce([]); // For child2

      const result = compositeTopic(rootTopic);

      expect(result).toBeInstanceOf(TopicNode);
      expect(result.id).toBe(rootTopic.id);
      expect(result.name).toBe(rootTopic.name);
      expect(result.content).toBe(rootTopic.content);
      expect(mockGetTopicsByParentId).toHaveBeenCalledTimes(4);
      expect(mockGetTopicsByParentId).toHaveBeenCalledWith('root');
      expect(mockGetTopicsByParentId).toHaveBeenCalledWith('child1');
      expect(mockGetTopicsByParentId).toHaveBeenCalledWith('child2');
      expect(mockGetTopicsByParentId).toHaveBeenCalledWith('grandchild1');
    });

    it('should handle topic with undefined id gracefully', () => {
      const topic: ITopic = {
        id: undefined,
        name: 'Topic without ID',
        content: 'Content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetTopicsByParentId.mockReturnValue([]);

      const result = compositeTopic(topic);

      expect(result).toBeInstanceOf(TopicNode);
      expect(result.id).toBeNull(); // TopicNode converts undefined to null
      expect(result.name).toBe(topic.name);
      expect(result.content).toBe(topic.content);
      expect(mockGetTopicsByParentId).toHaveBeenCalledWith(undefined);
    });

    it('should handle empty children array', () => {
      const topic: ITopic = {
        id: 'topic-empty',
        name: 'Topic with no children',
        content: 'Content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetTopicsByParentId.mockReturnValue([]);

      const result = compositeTopic(topic);

      expect(result).toBeInstanceOf(TopicNode);
      expect(result.id).toBe(topic.id);
      expect(result.name).toBe(topic.name);
      expect(result.content).toBe(topic.content);
      expect(mockGetTopicsByParentId).toHaveBeenCalledWith('topic-empty');
      expect(mockGetTopicsByParentId).toHaveBeenCalledTimes(1);
    });

    it('should preserve topic properties in the composed structure', () => {
      const topic: ITopic = {
        id: 'preserve-test',
        name: 'Preserve Test Topic',
        content: 'Test content with special chars: !@#$%',
        version: 5,
        parentTopicId: 'some-parent',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-12-31')
      };

      mockGetTopicsByParentId.mockReturnValue([]);

      const result = compositeTopic(topic);

      expect(result.id).toBe('preserve-test');
      expect(result.name).toBe('Preserve Test Topic');
      expect(result.content).toBe('Test content with special chars: !@#$%');
      expect(result.version).toBe(5);
      expect(result.parentTopicId).toBe('some-parent');
      expect(result.createdAt).toEqual(new Date('2023-01-01'));
      expect(result.updatedAt).toEqual(new Date('2023-12-31'));
    });
  });
});
