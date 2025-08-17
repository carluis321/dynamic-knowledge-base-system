import { z } from 'zod';

export const ResourceTypeSchema = z.enum(['video', 'article', 'pdf', 'other']);

export const CreateResourceSchema = z.object({
  topicId: z.uuid('Invalid topic ID format'),
  url: z.url('Invalid URL format'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  type: ResourceTypeSchema
});

export const UpdateResourceSchema = z.object({
  topicId: z.uuid('Invalid topic ID format').optional(),
  url: z.url('Invalid URL format').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  type: ResourceTypeSchema.optional()
});

export const ResourceParamsSchema = z.object({
  id: z.uuid('Invalid resource ID format')
});

export const ResourceTopicParamsSchema = z.object({
  topicId: z.uuid('Invalid topic ID format')
});

export type CreateResourceDto = z.infer<typeof CreateResourceSchema>;
export type UpdateResourceDto = z.infer<typeof UpdateResourceSchema>;
export type ResourceParamsDto = z.infer<typeof ResourceParamsSchema>;
export type ResourceTopicParamsDto = z.infer<typeof ResourceTopicParamsSchema>;
