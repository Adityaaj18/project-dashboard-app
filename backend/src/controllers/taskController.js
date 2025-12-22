import db from '../config/database.js';

// Get all tasks for a project
export const getTasks = (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify project belongs to user
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(projectId, userId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const tasks = db.prepare(`
      SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC
    `).all(projectId);

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// Create new task
export const createTask = (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, status } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    // Verify project belongs to user
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(projectId, userId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const insert = db.prepare(`
      INSERT INTO tasks (title, status, project_id)
      VALUES (?, ?, ?)
    `);

    const result = insert.run(title, status || 'todo', projectId);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// Update task
export const updateTask = (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { title, status } = req.body;
    const userId = req.user.id;

    // Verify project belongs to user
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(projectId, userId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if task exists in the project
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?').get(taskId, projectId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(taskId);

    const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

// Delete task
export const deleteTask = (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.id;

    // Verify project belongs to user
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(projectId, userId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if task exists in the project
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?').get(taskId, projectId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};
