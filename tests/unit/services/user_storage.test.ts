import { 
  getAllUsers, 
  createUser, 
  getUserById, 
  getUserByEmail, 
  updateUser, 
  deleteUser, 
  validateUserCredentials 
} from '../../../src/services/users/user_storage';
import type { IUser, UserRole } from '../../../src/core/types/user';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-1234')
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  hashSync: jest.fn(),
  compare: jest.fn()
}));

import bcrypt from 'bcrypt';
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('User Storage', () => {
  let initialUserCount: number;

  beforeEach(() => {
    jest.clearAllMocks();
    initialUserCount = getAllUsers().length;
    
    // Setup bcrypt mocks
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (mockedBcrypt.hashSync as jest.Mock).mockReturnValue('hashed-password-sync');
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    // Clean up any users created during tests
    const currentUsers = getAllUsers();
    const testUsers = currentUsers.filter(user => 
      user.id === 'mocked-uuid-1234' || 
      user.email?.includes('test') ||
      user.id?.startsWith('test-')
    );
    
    testUsers.forEach(user => {
      try {
        deleteUser(user.id!);
      } catch (error) {
        // User might already be deleted
      }
    });
  });

  describe('getAllUsers', () => {
    it('should return all users without passwords', () => {
      const users = getAllUsers();
      
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      expect(users[0]).toHaveProperty('id');
      expect(users[0]).toHaveProperty('name');
      expect(users[0]).toHaveProperty('email');
      expect(users[0]).toHaveProperty('role');
      expect(users[0]).not.toHaveProperty('password');
    });

    it('should return users with correct structure', () => {
      const users = getAllUsers();
      
      users.forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('createdAt');
        expect(user).toHaveProperty('updatedAt');
        expect(user).not.toHaveProperty('password');
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user with generated ID', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Viewer' as UserRole
      };

      const createdUser = await createUser(userData);

      expect(createdUser).toMatchObject({
        id: 'mocked-uuid-1234',
        name: 'Test User',
        email: 'test@example.com',
        role: 'Viewer' as UserRole
      });
      expect(createdUser).not.toHaveProperty('password');
      expect(createdUser.createdAt).toBeInstanceOf(Date);
      expect(createdUser.updatedAt).toBeInstanceOf(Date);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should create a user with provided ID', async () => {
      const userData = {
        id: 'test-user-123',
        name: 'Test User with ID',
        email: 'test-id@example.com',
        password: 'password123',
        role: 'Editor' as UserRole
      };

      const createdUser = await createUser(userData);

      expect(createdUser.id).toBe('test-user-123');
      expect(createdUser.name).toBe('Test User with ID');
      expect(createdUser.role).toBe('Editor');
    });

    it('should throw error when email already exists', async () => {
      const userData1 = {
        name: 'User One',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'Viewer' as UserRole
      };

      const userData2 = {
        name: 'User Two',
        email: 'duplicate@example.com',
        password: 'password456',
        role: 'Editor' as UserRole
      };

      await createUser(userData1);

      await expect(createUser(userData2)).rejects.toThrow('Email already exists');
    });

    it('should add user to storage', async () => {
      const initialCount = getAllUsers().length;
      
      const userData = {
        name: 'Test User',
        email: 'test-storage@example.com',
        password: 'password123',
        role: 'Viewer' as UserRole
      };

      await createUser(userData);

      const finalCount = getAllUsers().length;
      expect(finalCount).toBe(initialCount + 1);
    });
  });

  describe('getUserById', () => {
    it('should return user without password when found', async () => {
      const userData = {
        id: 'test-get-user',
        name: 'Test Get User',
        email: 'test-get@example.com',
        password: 'password123',
        role: 'Viewer' as UserRole
      };

      const createdUser = await createUser(userData);
      const foundUser = getUserById('test-get-user');

      expect(foundUser).toEqual(createdUser);
      expect(foundUser).not.toHaveProperty('password');
    });

    it('should throw error when user not found', () => {
      expect(() => {
        getUserById('non-existent-id');
      }).toThrow('User with id non-existent-id not found');
    });

    it('should return existing user from seed data', () => {
      const existingUserId = 'user-001';
      
      const user = getUserById(existingUserId);

      expect(user).toBeDefined();
      expect(user.id).toBe(existingUserId);
      expect(user.email).toBe('admin@example.com');
      expect(user).not.toHaveProperty('password');
    });
  });

  describe('getUserByEmail', () => {
    it('should return user with password when found', async () => {
      const userData = {
        name: 'Test Email User',
        email: 'test-email@example.com',
        password: 'password123',
        role: 'Viewer' as UserRole
      };

      await createUser(userData);
      const foundUser = getUserByEmail('test-email@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser!.email).toBe('test-email@example.com');
      expect(foundUser!.name).toBe('Test Email User');
      expect(foundUser).toHaveProperty('password'); // This method returns password
    });

    it('should return undefined when user not found', () => {
      const user = getUserByEmail('non-existent@example.com');
      
      expect(user).toBeUndefined();
    });

    it('should return existing user from seed data', () => {
      const existingEmail = 'admin@example.com';
      
      const user = getUserByEmail(existingEmail);

      expect(user).toBeDefined();
      expect(user!.email).toBe(existingEmail);
      expect(user!.name).toBe('Admin User');
      expect(user).toHaveProperty('password');
    });
  });

  describe('updateUser', () => {
    it('should update existing user without password change', async () => {
      const userData = {
        id: 'test-update-user',
        name: 'Original Name',
        email: 'original@example.com',
        password: 'password123',
        role: 'Viewer' as UserRole
      };

      const createdUser = await createUser(userData);
      const originalUpdatedAt = createdUser.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const updates = {
        name: 'Updated Name',
        role: 'Editor' as UserRole
      };

      const updatedUser = await updateUser('test-update-user', updates);

      expect(updatedUser.id).toBe('test-update-user');
      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.role).toBe('Editor');
      expect(updatedUser.email).toBe('original@example.com'); // Should remain unchanged
      expect(updatedUser).not.toHaveProperty('password');
      expect(updatedUser.updatedAt!.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt!.getTime());
    });

    it('should update user with password change', async () => {
      const userData = {
        id: 'test-update-password',
        name: 'Test User',
        email: 'test-password@example.com',
        password: 'oldpassword',
        role: 'Viewer' as UserRole
      };

      await createUser(userData);

      const updates = {
        password: 'newpassword123'
      };

      const updatedUser = await updateUser('test-update-password', updates);

      expect(updatedUser.id).toBe('test-update-password');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });

    it('should throw error when updating to existing email', async () => {
      const userData1 = {
        name: 'User One',
        email: 'user1@example.com',
        password: 'password123',
        role: 'Viewer' as UserRole
      };

      const userData2 = {
        id: 'user-2',
        name: 'User Two',
        email: 'user2@example.com',
        password: 'password456',
        role: 'Editor' as UserRole
      };

      await createUser(userData1);
      await createUser(userData2);

      const updates = {
        email: 'user1@example.com' // Try to use existing email
      };

      await expect(updateUser('user-2', updates)).rejects.toThrow('Email already exists');
    });

    it('should allow updating to same email', async () => {
      const userData = {
        id: 'test-same-email',
        name: 'Test User',
        email: 'same@example.com',
        password: 'password123',
        role: 'Viewer' as UserRole
      };

      await createUser(userData);

      const updates = {
        email: 'same@example.com', // Same email
        name: 'Updated Name'
      };

      const updatedUser = await updateUser('test-same-email', updates);

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.email).toBe('same@example.com');
    });

    it('should throw error when user not found', async () => {
      await expect(updateUser('non-existent-id', { name: 'New Name' }))
        .rejects.toThrow('User with id non-existent-id not found');
    });

    it('should preserve ID when updating', async () => {
      const userData = {
        id: 'test-preserve-id',
        name: 'Test User',
        email: 'preserve@example.com',
        password: 'password123',
        role: 'Viewer' as UserRole
      };

      await createUser(userData);

      const updates = {
        id: 'different-id', // This should be ignored
        name: 'Updated Name'
      };

      const updatedUser = await updateUser('test-preserve-id', updates);

      expect(updatedUser.id).toBe('test-preserve-id');
      expect(updatedUser.name).toBe('Updated Name');
    });
  });

  describe('deleteUser', () => {
    it('should delete existing user', async () => {
      const userData = {
        id: 'test-delete-user',
        name: 'Test Delete User',
        email: 'test-delete@example.com',
        password: 'password123',
        role: 'Viewer' as UserRole
      };

      await createUser(userData);
      const initialCount = getAllUsers().length;

      deleteUser('test-delete-user');

      const finalCount = getAllUsers().length;
      expect(finalCount).toBe(initialCount - 1);

      expect(() => {
        getUserById('test-delete-user');
      }).toThrow('User with id test-delete-user not found');
    });

    it('should throw error when user not found', () => {
      expect(() => {
        deleteUser('non-existent-id');
      }).toThrow('User with id non-existent-id not found');
    });
  });

  describe('validateUserCredentials', () => {
    it('should return user when credentials are valid', async () => {
      const userData = {
        name: 'Test Validate User',
        email: 'validate@example.com',
        password: 'password123',
        role: 'Viewer' as UserRole
      };

      await createUser(userData);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const validatedUser = await validateUserCredentials('validate@example.com', 'password123');

      expect(validatedUser).toBeDefined();
      expect(validatedUser!.email).toBe('validate@example.com');
      expect(validatedUser!.name).toBe('Test Validate User');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    });

    it('should return null when email not found', async () => {
      const validatedUser = await validateUserCredentials('nonexistent@example.com', 'password123');

      expect(validatedUser).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const userData = {
        name: 'Test Invalid Password',
        email: 'invalid-password@example.com',
        password: 'password123',
        role: 'Viewer' as UserRole
      };

      await createUser(userData);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const validatedUser = await validateUserCredentials('invalid-password@example.com', 'wrongpassword');

      expect(validatedUser).toBeNull();
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed-password');
    });

    it('should validate existing user from seed data', async () => {
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const validatedUser = await validateUserCredentials('admin@example.com', 'admin123');

      expect(validatedUser).toBeDefined();
      expect(validatedUser!.email).toBe('admin@example.com');
      expect(validatedUser!.name).toBe('Admin User');
    });
  });
});
