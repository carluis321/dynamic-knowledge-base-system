import type { ID } from './common';

export interface ITopic {
  id?: ID;
  name: string;
  content?: string;
  createdAt: Date;
  updatedAt?: Date;
  version?: number;
  parentTopicId?: string | null; // hierarchical relationship
}