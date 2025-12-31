import db from '../config/database.js';
import { canPerformAction, ROLES } from '../config/permissions.js';

// Get all projects for the authenticated user
export const getProjects = (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let projects;

    // Admins, Managers, and Team Leads can see all projects
    if ([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD].includes(userRole)) {
      projects = db.prepare(`
        SELECT
          p.id,
          p.name,
          p.description,
          p.status,
          p.user_id,
          COUNT(t.id) as totalTasks,
          SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completedTasks
        FROM projects p
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `).all();
    } else {
      // Developers and Viewers can only see their own projects
      projects = db.prepare(`
        SELECT
          p.id,
          p.name,
          p.description,
          p.status,
          p.user_id,
          COUNT(t.id) as totalTasks,
          SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completedTasks
        FROM projects p
        LEFT JOIN tasks t ON p.id = t.project_id
        WHERE p.user_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `).all(userId);
    }

    // Get tasks for each project
    const projectsWithTasks = projects.map(project => {
      const tasks = db.prepare(`
        SELECT id, title, status, created_at, updated_at
        FROM tasks
        WHERE project_id = ?
        ORDER BY created_at DESC
      `).all(project.id);

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        totalTasks: project.totalTasks || 0,
        completedTasks: project.completedTasks || 0,
        tasks: tasks.map(task => ({
          id: task.id,
          title: task.title,
          status: task.status
        }))
      };
    });

    res.json({
      success: true,
      data: projectsWithTasks
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// Get single project by ID
export const getProject = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = db.prepare(`
      SELECT p.*,
        COUNT(t.id) as totalTasks,
        SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completedTasks
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.id = ? AND p.user_id = ?
      GROUP BY p.id
    `).get(id, userId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const tasks = db.prepare(`
      SELECT id, title, status, created_at, updated_at
      FROM tasks
      WHERE project_id = ?
      ORDER BY created_at DESC
    `).all(id);

    res.json({
      success: true,
      data: {
        ...project,
        totalTasks: project.totalTasks || 0,
        completedTasks: project.completedTasks || 0,
        tasks
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};

// Create new project
export const createProject = (req, res) => {
  try {
    const { name, description, status } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    const insert = db.prepare(`
      INSERT INTO projects (name, description, status, user_id)
      VALUES (?, ?, ?, ?)
    `);

    const result = insert.run(
      name,
      description || '',
      status || 'active',
      userId
    );

    const project = db.prepare(`
      SELECT * FROM projects WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        ...project,
        totalTasks: 0,
        completedTasks: 0,
        tasks: []
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// Update project
export const updateProject = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get project
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const isOwner = project.user_id === userId;
    const canEdit = canPerformAction(userRole, 'edit', 'project', isOwner);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this project'
      });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
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
    values.push(id);

    const query = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);

    // Get updated project with tasks
    const updatedProject = db.prepare(`
      SELECT p.*,
        COUNT(t.id) as totalTasks,
        SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completedTasks
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.id = ?
      GROUP BY p.id
    `).get(id);

    const tasks = db.prepare(`
      SELECT id, title, status FROM tasks WHERE project_id = ?
    `).all(id);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: {
        ...updatedProject,
        totalTasks: updatedProject.totalTasks || 0,
        completedTasks: updatedProject.completedTasks || 0,
        tasks
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// Delete project
export const deleteProject = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get project
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const isOwner = project.user_id === userId;
    const canDelete = canPerformAction(userRole, 'delete', 'project', isOwner);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this project'
      });
    }

    // Delete project (tasks will be deleted automatically due to CASCADE)
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
};
