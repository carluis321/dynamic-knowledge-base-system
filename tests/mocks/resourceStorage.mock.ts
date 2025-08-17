export const mockResourceStorage = {
  getAllResources: jest.fn(),
  createResource: jest.fn(),
  updateResource: jest.fn(),
  getResourceById: jest.fn(),
  getResourcesByTopicId: jest.fn(),
  deleteResource: jest.fn(),
};

// Mock data
export const mockResource = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  topicId: '123e4567-e89b-12d3-a456-426614174001',
  url: 'https://example.com/resource',
  description: 'Test resource',
  type: 'article' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockResources = [
  mockResource,
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    topicId: '123e4567-e89b-12d3-a456-426614174001',
    url: 'https://example.com/resource2',
    description: 'Test resource 2',
    type: 'video' as const,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Reset all mocks
export const resetResourceMocks = () => {
  Object.values(mockResourceStorage).forEach(mock => mock.mockReset());
};
