const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { getPermissions } = require('../config/permissions');

// Generate avatar URL
const generateAvatar = (name) => {
  const initial = name.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'viewer', department = 'General' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = generateAvatar(name);

    // Insert user
    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, department, avatar, provider)
      VALUES (?, ?, ?, ?, ?, ?, 'email')
    `).run(name, email, hashedPassword, role, department, avatar);

    const user = db.prepare('SELECT id, name, email, role, department, avatar, provider, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND provider = ?').get(email, 'email');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Profile
const getProfile = (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, role, department, avatar, provider, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get statistics
    const tasksCompleted = db.prepare(`
      SELECT COUNT(*) as count FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.owner_id = ? AND t.status = 'done'
    `).get(req.user.id).count;

    const activeProjects = db.prepare(`
      SELECT COUNT(*) as count FROM projects
      WHERE owner_id = ? AND status = 'active'
    `).get(req.user.id).count;

    res.json({
      ...user,
      tasksCompleted,
      activeProjects
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { name, department } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const avatar = generateAvatar(name);

    db.prepare(`
      UPDATE users
      SET name = ?, department = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, department || 'General', avatar, req.user.id);

    const user = db.prepare(`
      SELECT id, name, email, role, department, avatar, provider, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    if (user.provider !== 'email') {
      return res.status(400).json({ error: 'Cannot change password for OAuth users' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.prepare(`
      UPDATE users
      SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(hashedPassword, req.user.id);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Permissions
const getPermissionsForUser = (req, res) => {
  try {
    const permissions = getPermissions(req.user.role);
    res.json(permissions);
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get All Users (Admin/Manager only)
const getAllUsers = (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, name, email, role, department, avatar, provider, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update User Role
const updateUserRole = (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['admin', 'manager', 'team lead', 'developer', 'viewer'];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Allow users to change their own role
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.prepare(`
      UPDATE users
      SET role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(role.toLowerCase(), userId);

    const updatedUser = db.prepare(`
      SELECT id, name, email, role, department, avatar, provider, created_at
      FROM users WHERE id = ?
    `).get(userId);

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getPermissionsForUser,
  getAllUsers,
  updateUserRole
};
