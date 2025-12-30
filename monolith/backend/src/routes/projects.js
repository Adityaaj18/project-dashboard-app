const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');
const checkPermission = require('../middleware/rbac');

// All routes require authentication
router.use(authMiddleware);

// Project routes
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.post('/', checkPermission('createProject'), projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Task routes
router.get('/:id/tasks', projectController.getTasks);
router.post('/:id/tasks', checkPermission('createTask'), projectController.createTask);
router.put('/:id/tasks/:taskId', checkPermission('editTask'), projectController.updateTask);
router.delete('/:id/tasks/:taskId', checkPermission('deleteTask'), projectController.deleteTask);

module.exports = router;
