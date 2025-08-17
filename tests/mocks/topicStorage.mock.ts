export const mockTopicStorage = {
  getAllTopics: jest.fn(),
  createTopic: jest.fn(),
  updateTopic: jest.fn(),
  getTopicById: jest.fn(),
  getTopicsByParentId: jest.fn(),
  deleteTopicsByIds: jest.fn(),
};

// Mock data
export const mockTopic = {
  id: '123e4567-e89b-12d3-a456-426614174010',
  name: 'Test Topic',
  content: 'Test topic content',
  parentTopicId: null,
  version: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockChildTopic = {
  id: '123e4567-e89b-12d3-a456-426614174011',
  name: 'Child Topic',
  content: 'Child topic content',
  parentTopicId: '123e4567-e89b-12d3-a456-426614174010',
  version: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockTopics = [mockTopic, mockChildTopic];

// Reset all mocks
export const resetTopicMocks = () => {
  Object.values(mockTopicStorage).forEach(mock => mock.mockReset());
};
