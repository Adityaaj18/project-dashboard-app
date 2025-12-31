import { hasPermission, canPerformAction } from '../config/permissions.js';

/**
 * Middleware to check if user has required permission
 * @param {string} permission - Required permission
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: permission,
        userRole: userRole
      });
    }

    next();
  };
};

/**
 * Middleware to check if user can perform action on resource
 * @param {string} resource - Resource type (project, task, user)
 * @param {string} action - Action to perform
 * @param {function} getOwnerId - Function to extract owner ID from request
 */
export const requireAction = (resource, action, getOwnerId = null) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Determine if user is owner
    let isOwner = false;
    if (getOwnerId && userId) {
      const ownerId = getOwnerId(req);
      isOwner = ownerId === userId;
    }

    if (!canPerformAction(userRole, action, resource, isOwner)) {
      return res.status(403).json({
        success: false,
        message: `You don't have permission to ${action} this ${resource}`,
        userRole: userRole
      });
    }

    // Store permission context in request
    req.permissionContext = { isOwner, resource, action };
    next();
  };
};

/**
 * Middleware to check if user has one of multiple roles
 * @param {string[]} allowedRoles - Array of allowed roles
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: allowedRoles,
        userRole: userRole
      });
    }

    next();
  };
};

export default {
  requirePermission,
  requireAction,
  requireRole
};
