const db = require('../config/database');
const { hasPermission } = require('../config/permissions');

// Get Projects
const getProjects = (req, res) => {
  try {
    const userPermissions = hasPermission(req.user.role, 'viewAllProjects');

    let projects;
    if (userPermissions) {
      // User can view all projects
      projects = db.prepare(`
        SELECT p.*, u.name as owner_name,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as completed_tasks
        FROM projects p
        JOIN users u ON p.owner_id = u.id
        ORDER BY p.created_at DESC
      `).all();
    } else {
      // User can only view own projects
      projects = db.prepare(`
        SELECT p.*, u.name as owner_name,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as completed_tasks
        FROM projects p
        JOIN users u ON p.owner_id = u.id
        WHERE p.owner_id = ?
        ORDER BY p.created_at DESC
      `).all(req.user.id);
    }

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Single Project
const getProject = (req, res) => {
  try {
    const { id } = req.params;

    const project = db.prepare(`
      SELECT p.*, u.name as owner_name,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as completed_tasks
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `).get(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const canViewAll = hasPermission(req.user.role, 'viewAllProjects');
    const canViewOwn = hasPermission(req.user.role, 'viewOwnProjects');

    if (!canViewAll && (!canViewOwn || project.owner_id !== req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create Project
const createProject = (req, res) => {
  try {
    const { name, description, status = 'active' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const result = db.prepare(`
      INSERT INTO projects (name, description, status, owner_id)
      VALUES (?, ?, ?, ?)
    `).run(name, description || '', status, req.user.id);

    const project = db.prepare(`
      SELECT p.*, u.name as owner_name,
      0 as task_count,
      0 as completed_tasks
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Project
const updateProject = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const canEditAny = hasPermission(req.user.role, 'editAnyProject');
    const canEditOwn = hasPermission(req.user.role, 'editOwnProject');

    if (!canEditAny && (!canEditOwn || project.owner_id !== req.user.id)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    db.prepare(`
      UPDATE projects
      SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name || project.name, description !== undefined ? description : project.description, status || project.status, id);

    const updatedProject = db.prepare(`
      SELECT p.*, u.name as owner_name,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as completed_tasks
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `).get(id);

    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete Project
const deleteProject = (req, res) => {
  try {
    const { id } = req.params;

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const canDeleteAny = hasPermission(req.user.role, 'deleteAnyProject');
    const canDeleteOwn = hasPermission(req.user.role, 'deleteOwnProject');

    if (!canDeleteAny && (!canDeleteOwn || project.owner_id !== req.user.id)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Tasks for Project
const getTasks = (req, res) => {
  try {
    const { id } = req.params;

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const canViewAll = hasPermission(req.user.role, 'viewAllProjects');
    const canViewOwn = hasPermission(req.user.role, 'viewOwnProjects');

    if (!canViewAll && (!canViewOwn || project.owner_id !== req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const tasks = db.prepare(`
      SELECT * FROM tasks
      WHERE project_id = ?
      ORDER BY created_at DESC
    `).all(id);

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create Task
const createTask = (req, res) => {
  try {
    const { id } = req.params;
    const { title, status = 'todo' } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const result = db.prepare(`
      INSERT INTO tasks (title, status, project_id)
      VALUES (?, ?, ?)
    `).run(title, status, id);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Task
const updateTask = (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { title, status } = req.body;

    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?').get(taskId, id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.prepare(`
      UPDATE tasks
      SET title = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title !== undefined ? title : task.title, status || task.status, taskId);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete Task
const deleteTask = (req, res) => {
  try {
    const { id, taskId } = req.params;

    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?').get(taskId, id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
