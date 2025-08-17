import express from 'express';
import resourceController from '../controllers/resource';
import { verifyToken, requireRole } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validation';
import { 
  CreateResourceSchema, 
  UpdateResourceSchema, 
  ResourceParamsSchema,
  ResourceTopicParamsSchema 
} from '../schemas/resource.schemas';

const router = express.Router();

// Public read access for all authenticated users
router.get('/', verifyToken, resourceController.getAll);
router.get('/:id', verifyToken, validateParams(ResourceParamsSchema), resourceController.get);
router.get('/topic/:topicId', verifyToken, validateParams(ResourceTopicParamsSchema), resourceController.getByTopicId);

// Admin and Editor can create and update resources
router.post('/', verifyToken, requireRole(['Admin', 'Editor']), validateBody(CreateResourceSchema), resourceController.create);
router.put('/:id', verifyToken, requireRole(['Admin', 'Editor']), validateParams(ResourceParamsSchema), validateBody(UpdateResourceSchema), resourceController.update);

// Only Admin can delete resources
router.delete('/:id', verifyToken, requireRole(['Admin']), validateParams(ResourceParamsSchema), resourceController.remove);

export default router;
