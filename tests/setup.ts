// Global test setup
beforeAll(() => {
  // Setup global test environment
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Reset any mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});
