import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { PERMISSIONS } from '../config/permissions.js';
import db from '../config/database.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Helper to get project owner ID from request
const getProjectOwnerId = (req) => {
  const projectId = req.params.id;
  const project = db.prepare('SELECT user_id FROM projects WHERE id = ?').get(projectId);
  return project?.user_id;
};

// Get all projects (role-based filtering applied in controller)
router.get('/', getProjects);

// Get single project
router.get('/:id', getProject);

// Create project - requires create permission
router.post('/', requirePermission(PERMISSIONS.CREATE_PROJECT), createProject);

// Update project - permission check in controller based on ownership
router.put('/:id', updateProject);

// Delete project - permission check in controller based on ownership
router.delete('/:id', deleteProject);

export default router;
