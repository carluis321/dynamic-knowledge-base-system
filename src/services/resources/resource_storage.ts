import { v4 as uuidV4 } from 'uuid';
import { IResource } from "../../core/types/resource";

let resources: IResource[] = [
  {
    id: "res-001",
    topicId: "a1b2c3d4-5e6f-4a7b-9c8d-0e1f2a3b4c5d",
    url: "https://www.postgresql.org/docs/",
    description: "Official PostgreSQL Documentation",
    type: "article",
    createdAt: new Date("2025-08-10T10:00:00.000Z"),
    updatedAt: new Date("2025-08-10T10:00:00.000Z")
  },
  {
    id: "res-002",
    topicId: "e5f6a7b8-92a3-4ebf-9a01-4c5d6e7f8091",
    url: "https://www.youtube.com/watch?v=postgresql-tutorial",
    description: "PostgreSQL Complete Tutorial",
    type: "video",
    createdAt: new Date("2025-08-12T12:00:00.000Z"),
    updatedAt: new Date("2025-08-12T12:00:00.000Z")
  },
  {
    id: "res-003",
    topicId: "c7d8e9f0-2b3c-4d5e-9f01-1b2c3d4e5f60",
    url: "https://example.com/backup-strategies.pdf",
    description: "PostgreSQL Backup and Recovery Best Practices",
    type: "pdf",
    createdAt: new Date("2025-08-14T09:00:00.000Z"),
    updatedAt: new Date("2025-08-14T09:00:00.000Z")
  }
];

export const getAllResources = (): IResource[] => {
  return resources;
};

export const createResource = (resource: Partial<IResource> & { topicId: string; url: string; type: string }): IResource => {
  const id = resource.id ?? uuidV4();

  const newResource: IResource = {
    ...resource,
    id,
    type: resource.type as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  resources.push(newResource);
  return newResource;
};

export const getResourceById = (id: string): IResource => {
  const found = resources.find(resource => resource.id === id);
  
  if (!found) throw new Error(`Resource with id ${id} not found`);
  
  return found;
};

export const getResourcesByTopicId = (topicId: string): IResource[] => {
  return resources.filter(resource => resource.topicId === topicId);
};

export const updateResource = (id: string, updates: Partial<IResource>): IResource => {
  const resourceIndex = resources.findIndex(resource => resource.id === id);
  
  if (resourceIndex === -1) {
    throw new Error(`Resource with id ${id} not found`);
  }

  const updatedResource: IResource = {
    ...resources[resourceIndex],
    ...updates,
    id,
    updatedAt: new Date(),
  };

  resources[resourceIndex] = updatedResource;
  return updatedResource;
};

export const deleteResource = (id: string): void => {
  const resourceIndex = resources.findIndex(resource => resource.id === id);
  
  if (resourceIndex === -1) {
    throw new Error(`Resource with id ${id} not found`);
  }

  resources.splice(resourceIndex, 1);
};

export const deleteResourcesByTopicId = (topicId: string): void => {
  resources = resources.filter(resource => resource.topicId !== topicId);
};
