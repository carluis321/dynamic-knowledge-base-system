import type { Request, Response } from "express";
import {
  getAllResources,
  createResource,
  updateResource,
  getResourceById,
  getResourcesByTopicId,
  deleteResource,
} from "../services/resources/resource_storage";
import { createNotFoundError } from "../core/utils/errorHelpers";

const getAll = (_req: Request, res: Response) => {
  res.status(200).json(getAllResources());
};

const get = (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const resource = getResourceById(id);
    res.status(200).json(resource);
  } catch (error) {
    throw createNotFoundError('Resource');
  }
};

const getByTopicId = (req: Request, res: Response) => {
  const { topicId } = req.params;

  const resources = getResourcesByTopicId(topicId);
  res.status(200).json(resources);
};

const create = (req: Request, res: Response) => {
  const { topicId, url, description, type } = req.body;

  const resource = createResource({ topicId, url, description, type });
  res.status(201).json(resource);
};

const update = (req: Request, res: Response) => {
  const { id } = req.params;
  const { topicId, url, description, type } = req.body;

  try {
    const updatedResource = updateResource(id, { topicId, url, description, type });
    res.status(200).json(updatedResource);
  } catch (error) {
    throw createNotFoundError('Resource');
  }
};

const remove = (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    deleteResource(id);
    res.status(204).send();
  } catch (error) {
    throw createNotFoundError('Resource');
  }
};

export default {
  getAll,
  get,
  getByTopicId,
  create,
  update,
  remove,
};
