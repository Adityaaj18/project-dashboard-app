import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create avatar URL
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff`;

    // Insert user
    const insert = db.prepare(`
      INSERT INTO users (name, email, password, avatar, role, department)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name,
      email,
      hashedPassword,
      avatar,
      role || 'Developer',
      department || 'Engineering'
    );

    // Get created user
    const user = db.prepare(`
      SELECT id, name, email, avatar, role, department, join_date, tasks_completed, active_projects
      FROM users WHERE id = ?
    `).get(result.lastInsertRowid);

    // Generate token
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          department: user.department,
          joinDate: user.join_date,
          tasksCompleted: user.tasks_completed,
          activeProjects: user.active_projects
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          department: user.department,
          joinDate: user.join_date,
          tasksCompleted: user.tasks_completed,
          activeProjects: user.active_projects
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Get current user profile
export const getProfile = (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, avatar, role, department, join_date, tasks_completed, active_projects
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        department: user.department,
        joinDate: user.join_date,
        tasksCompleted: user.tasks_completed,
        activeProjects: user.active_projects
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update user profile
export const updateProfile = (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    const userId = req.user.id;

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    if (department) {
      updates.push('department = ?');
      values.push(department);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);

    // Get updated user
    const user = db.prepare(`
      SELECT id, name, email, avatar, role, department, join_date, tasks_completed, active_projects
      FROM users WHERE id = ?
    `).get(userId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        department: user.department,
        joinDate: user.join_date,
        tasksCompleted: user.tasks_completed,
        activeProjects: user.active_projects
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};
