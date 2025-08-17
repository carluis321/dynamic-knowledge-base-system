import { shortestPathBetweenTopics } from '../../../src/services/topics/algorithms/topic_path_finder';
import { getTopicById } from '../../../src/services/topics/topic_storage';
import type { ITopic } from '../../../src/core/types/topic';

// Mock the topic_storage module
jest.mock('../../../src/services/topics/topic_storage', () => ({
  getTopicById: jest.fn()
}));

const mockGetTopicById = getTopicById as jest.MockedFunction<typeof getTopicById>;

describe('Topic Path Finder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shortestPathBetweenTopics', () => {
    it('should return direct path when start topic is parent of end topic', () => {
      const startTopic: ITopic = {
        id: 'parent-topic',
        name: 'Parent Topic',
        content: 'Parent content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const endTopic: ITopic = {
        id: 'child-topic',
        name: 'Child Topic',
        content: 'Child content',
        version: 1,
        parentTopicId: 'parent-topic',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const parentTopic: ITopic = {
        id: 'parent-topic',
        name: 'Parent Topic',
        content: 'Parent content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetTopicById.mockReturnValue(parentTopic);

      const result = shortestPathBetweenTopics(startTopic, endTopic);

      expect(result).toEqual(['parent-topic', 'child-topic']);
      expect(mockGetTopicById).toHaveBeenCalledWith('parent-topic');
    });

    it('should return recursive path through multiple levels', () => {
      const startTopic: ITopic = {
        id: 'root-topic',
        name: 'Root Topic',
        content: 'Root content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const endTopic: ITopic = {
        id: 'grandchild-topic',
        name: 'Grandchild Topic',
        content: 'Grandchild content',
        version: 1,
        parentTopicId: 'child-topic',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const childTopic: ITopic = {
        id: 'child-topic',
        name: 'Child Topic',
        content: 'Child content',
        version: 1,
        parentTopicId: 'root-topic',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const rootTopic: ITopic = {
        id: 'root-topic',
        name: 'Root Topic',
        content: 'Root content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetTopicById
        .mockReturnValueOnce(childTopic) // First call for grandchild's parent
        .mockReturnValueOnce(rootTopic); // Second call for child's parent

      const result = shortestPathBetweenTopics(startTopic, endTopic);

      expect(result).toEqual(['root-topic', 'child-topic', 'grandchild-topic']);
      expect(mockGetTopicById).toHaveBeenCalledTimes(2);
      expect(mockGetTopicById).toHaveBeenCalledWith('child-topic');
      expect(mockGetTopicById).toHaveBeenCalledWith('root-topic');
    });

    it('should handle error when parent topic not found', () => {
      const startTopic: ITopic = {
        id: 'start-topic',
        name: 'Start Topic',
        content: 'Start content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const endTopic: ITopic = {
        id: 'end-topic',
        name: 'End Topic',
        content: 'End content',
        version: 1,
        parentTopicId: 'non-existent-parent',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetTopicById.mockImplementation(() => {
        throw new Error('Topic not found');
      });

      const result = shortestPathBetweenTopics(startTopic, endTopic);

      expect(result).toEqual(['start-topic']);
      expect(mockGetTopicById).toHaveBeenCalledWith('non-existent-parent');
    });

    it('should handle deep nested hierarchy', () => {
      const startTopic: ITopic = {
        id: 'level-0',
        name: 'Level 0',
        content: 'Level 0 content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const endTopic: ITopic = {
        id: 'level-4',
        name: 'Level 4',
        content: 'Level 4 content',
        version: 1,
        parentTopicId: 'level-3',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const level3: ITopic = {
        id: 'level-3',
        name: 'Level 3',
        content: 'Level 3 content',
        version: 1,
        parentTopicId: 'level-2',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const level2: ITopic = {
        id: 'level-2',
        name: 'Level 2',
        content: 'Level 2 content',
        version: 1,
        parentTopicId: 'level-1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const level1: ITopic = {
        id: 'level-1',
        name: 'Level 1',
        content: 'Level 1 content',
        version: 1,
        parentTopicId: 'level-0',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const level0: ITopic = {
        id: 'level-0',
        name: 'Level 0',
        content: 'Level 0 content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetTopicById
        .mockReturnValueOnce(level3)
        .mockReturnValueOnce(level2)
        .mockReturnValueOnce(level1)
        .mockReturnValueOnce(level0);

      const result = shortestPathBetweenTopics(startTopic, endTopic);

      expect(result).toEqual(['level-0', 'level-1', 'level-2', 'level-3', 'level-4']);
      expect(mockGetTopicById).toHaveBeenCalledTimes(4);
    });

    it('should handle end topic with null parent', () => {
      const startTopic: ITopic = {
        id: 'start-topic',
        name: 'Start Topic',
        content: 'Start content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const endTopic: ITopic = {
        id: 'end-topic',
        name: 'End Topic',
        content: 'End content',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetTopicById.mockImplementation(() => {
        throw new Error('Topic not found');
      });

      const result = shortestPathBetweenTopics(startTopic, endTopic);

      expect(result).toEqual(['start-topic']);
      expect(mockGetTopicById).toHaveBeenCalledWith(null);
    });

    it('should handle circular reference by finding valid path', () => {
      const startTopic: ITopic = {
        id: 'topic-a',
        name: 'Topic A',
        content: 'Content A',
        version: 1,
        parentTopicId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const endTopic: ITopic = {
        id: 'topic-b',
        name: 'Topic B',
        content: 'Content B',
        version: 1,
        parentTopicId: 'topic-c',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const topicC: ITopic = {
        id: 'topic-c',
        name: 'Topic C',
        content: 'Content C',
        version: 1,
        parentTopicId: 'topic-a', // Points back to start topic
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetTopicById
        .mockReturnValueOnce(topicC) // First call for topic-c
        .mockReturnValueOnce(startTopic); // Second call for topic-a

      const result = shortestPathBetweenTopics(startTopic, endTopic);

      expect(result).toEqual(['topic-a', 'topic-c', 'topic-b']);
      expect(mockGetTopicById).toHaveBeenCalledTimes(2);
    });
  });
});
