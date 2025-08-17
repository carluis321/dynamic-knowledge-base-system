import express from 'express';
import userController from '../controllers/user';
import { verifyToken, requireRole } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validation';
import { 
  CreateUserSchema, 
  UpdateUserSchema, 
  LoginSchema, 
  UserParamsSchema 
} from '../schemas/user.schemas';

const router = express.Router();

// Public routes
router.post('/login', validateBody(LoginSchema), userController.login);

// Protected routes - require authentication
router.get('/profile', verifyToken, userController.getProfile);

// Admin only routes
router.get('/', verifyToken, requireRole(['Admin']), userController.getAll);
router.post('/', verifyToken, requireRole(['Admin']), validateBody(CreateUserSchema), userController.create);
router.put('/:id', verifyToken, requireRole(['Admin']), validateParams(UserParamsSchema), validateBody(UpdateUserSchema), userController.update);
router.delete('/:id', verifyToken, requireRole(['Admin']), validateParams(UserParamsSchema), userController.remove);

// Admin and Editor can view specific users
router.get('/:id', verifyToken, requireRole(['Admin', 'Editor']), validateParams(UserParamsSchema), userController.get);

export default router;
