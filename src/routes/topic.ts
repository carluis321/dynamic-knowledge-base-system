import express from 'express';
import topicController from '../controllers/topic';
import { verifyToken, requireRole } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validation';
import { 
  CreateTopicSchema, 
  UpdateTopicSchema, 
  TopicParamsSchema,
  ShortestPathSchema 
} from '../schemas/topic.schemas';

const router = express.Router();

// Public read access for all authenticated users
router.get('/', verifyToken, topicController.getAll);
router.get('/:id', verifyToken, validateParams(TopicParamsSchema), topicController.get);
router.post('/shortest-path', verifyToken, validateBody(ShortestPathSchema), topicController.shortestPath);

// Admin and Editor can create and update topics
router.post('/', verifyToken, requireRole(['Admin', 'Editor']), validateBody(CreateTopicSchema), topicController.create);
router.put('/:id', verifyToken, requireRole(['Admin', 'Editor']), validateParams(TopicParamsSchema), validateBody(UpdateTopicSchema), topicController.update);

// Only Admin can delete topics
router.delete('/:id', verifyToken, requireRole(['Admin']), validateParams(TopicParamsSchema), topicController.remove);

export default router;

