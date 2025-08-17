import type { ID } from './common';

export type ResourceType = 'video' | 'article' | 'pdf' | 'other';

export interface IResource {
  id?: ID;
  topicId: string;
  url: string;
  description?: string;
  type: ResourceType;
  createdAt: Date;
  updatedAt?: Date;
}