import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/:projectId/tasks', getTasks);
router.post('/:projectId/tasks', createTask);
router.put('/:projectId/tasks/:taskId', updateTask);
router.delete('/:projectId/tasks/:taskId', deleteTask);

export default router;
