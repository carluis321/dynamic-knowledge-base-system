import { z } from 'zod';

export const UserRoleSchema = z.enum(['Admin', 'Editor', 'Viewer']);

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be less than 100 characters'),
  role: UserRoleSchema
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
  email: z.email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be less than 100 characters').optional(),
  role: UserRoleSchema.optional()
});

export const LoginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const UserParamsSchema = z.object({
  id: z.uuid('Invalid user ID format')
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type UserParamsDto = z.infer<typeof UserParamsSchema>;
