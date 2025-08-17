import express from 'express';
import topicsRouter from './topic';
import resourcesRouter from './resource';
import usersRouter from './user';

const router = express.Router();

router.use('/topics', topicsRouter);
router.use('/resources', resourcesRouter);
router.use('/users', usersRouter);

export default router;