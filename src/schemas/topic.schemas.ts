import { z } from 'zod';

export const CreateTopicSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name must be less than 200 characters'),
  content: z.string().max(2000, 'Content must be less than 2000 characters').optional(),
  parentTopicId: z.uuid('Invalid parent topic ID format').nullable().optional()
});

export const UpdateTopicSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name must be less than 200 characters').optional(),
  content: z.string().max(2000, 'Content must be less than 2000 characters').optional(),
  parentTopicId: z.uuid('Invalid parent topic ID format').nullable().optional()
});

export const TopicParamsSchema = z.object({
  id: z.uuid('Invalid topic ID format')
});

export const ShortestPathSchema = z.object({
  startTopicId: z.uuid('Invalid start topic ID format'),
  endTopicId: z.uuid('Invalid end topic ID format')
});

export type CreateTopicDto = z.infer<typeof CreateTopicSchema>;
export type UpdateTopicDto = z.infer<typeof UpdateTopicSchema>;
export type TopicParamsDto = z.infer<typeof TopicParamsSchema>;
export type ShortestPathDto = z.infer<typeof ShortestPathSchema>;
