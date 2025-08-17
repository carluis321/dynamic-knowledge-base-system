import type { Request, Response } from "express";
import { TopicFactory } from "../services/topics/factory/topic_factory";
import { compositeTopic } from "../services/topics/composite/topic_composer";
import { shortestPathBetweenTopics } from "../services/topics/algorithms/topic_path_finder";
import {
  getAllTopics,
  createTopic,
  updateTopic,
  getTopicById,
  deleteTopicsByIds,
} from "../services/topics/topic_storage";
import { createNotFoundError } from "../core/utils/errorHelpers";

const getAll = (_req: Request, res: Response) => {
  res.status(200).json(getAllTopics());
};

const get = (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const topic = getTopicById(id);
    const compositedTopic = compositeTopic(topic);
    res.status(200).json(compositedTopic);
  } catch (error) {
    throw createNotFoundError('Topic');
  }
};

const create = (req: Request, res: Response) => {
  const { name, content, parentTopicId } = req.body;

  const topic = TopicFactory.create(name, content, parentTopicId);
  const saved_topic = createTopic(topic);

  res.status(201).json(saved_topic);
};

const update = (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, content, parentTopicId } = req.body;

  try {
    const topic = getTopicById(id);
    const topicToUpdate = TopicFactory.create(name, content, parentTopicId, topic.version! + 1, id);
    const updatedTopic = updateTopic(topicToUpdate);
    res.status(200).json(updatedTopic);
  } catch (error) {
    throw createNotFoundError('Topic');
  }
};

const remove = (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const topic = getTopicById(id);
    const compositedTopic = compositeTopic(topic);
    const allIDs = compositedTopic.getAllIDs();
    deleteTopicsByIds(allIDs);
    res.status(204).send();
  } catch (error) {
    throw createNotFoundError('Topic');
  }
};

const shortestPath = (req: Request, res: Response) => {
  const { startTopicId, endTopicId } = req.body;

  try {
    const startTopic = getTopicById(startTopicId);
    const endTopic = getTopicById(endTopicId);
    const path = shortestPathBetweenTopics(startTopic, endTopic);

    if (path.length === 0) {
      throw createNotFoundError('Path between topics');
    }

    res.status(200).json({ path });
  } catch (error) {
    if ((error as Error).message?.includes('not found')) {
      throw createNotFoundError('Topic');
    }
    throw error;
  }
};

export default {
  getAll,
  get,
  create,
  update,
  remove,
  shortestPath
};
 