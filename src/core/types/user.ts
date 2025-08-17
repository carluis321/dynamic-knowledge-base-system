import type { ID } from './common';

export type UserRole = 'Admin' | 'Editor' | 'Viewer';

export interface IUser {
  id?: ID;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt?: Date;
}
