// Frontend permissions utility - mirrors backend permissions

export const PERMISSIONS = {
  // User permissions
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  DELETE_USERS: 'delete_users',

  // Project permissions
  VIEW_ALL_PROJECTS: 'view_all_projects',
  VIEW_OWN_PROJECTS: 'view_own_projects',
  CREATE_PROJECT: 'create_project',
  EDIT_OWN_PROJECT: 'edit_own_project',
  EDIT_ANY_PROJECT: 'edit_any_project',
  DELETE_OWN_PROJECT: 'delete_own_project',
  DELETE_ANY_PROJECT: 'delete_any_project',

  // Task permissions
  CREATE_TASK: 'create_task',
  EDIT_OWN_TASK: 'edit_own_task',
  EDIT_ANY_TASK: 'edit_any_task',
  DELETE_OWN_TASK: 'delete_own_task',
  DELETE_ANY_TASK: 'delete_any_task',

  // Settings permissions
  CHANGE_OWN_PASSWORD: 'change_own_password',
  VIEW_SETTINGS: 'view_settings'
};

/**
 * Check if user has a specific permission
 * @param {Array} userPermissions - Array of user's permissions
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (userPermissions, permission) => {
  if (!userPermissions) return false;
  return userPermissions.includes(permission);
};

/**
 * Check if user can perform action on a resource
 * @param {Array} userPermissions - User's permissions
 * @param {string} action - Action (create, edit, delete, view)
 * @param {string} resource - Resource (project, task, user)
 * @param {boolean} isOwner - Whether user owns the resource
 * @returns {boolean}
 */
export const canPerform = (userPermissions, action, resource, isOwner = false) => {
  const permissionMap = {
    project: {
      view: isOwner ? PERMISSIONS.VIEW_OWN_PROJECTS : PERMISSIONS.VIEW_ALL_PROJECTS,
      create: PERMISSIONS.CREATE_PROJECT,
      edit: isOwner ? PERMISSIONS.EDIT_OWN_PROJECT : PERMISSIONS.EDIT_ANY_PROJECT,
      delete: isOwner ? PERMISSIONS.DELETE_OWN_PROJECT : PERMISSIONS.DELETE_ANY_PROJECT
    },
    task: {
      create: PERMISSIONS.CREATE_TASK,
      edit: isOwner ? PERMISSIONS.EDIT_OWN_TASK : PERMISSIONS.EDIT_ANY_TASK,
      delete: isOwner ? PERMISSIONS.DELETE_OWN_TASK : PERMISSIONS.DELETE_ANY_TASK
    },
    user: {
      view: PERMISSIONS.VIEW_USERS,
      manage: PERMISSIONS.MANAGE_USERS,
      delete: PERMISSIONS.DELETE_USERS
    }
  };

  const permission = permissionMap[resource]?.[action];
  if (!permission) return false;

  // If checking for own resource, also check if they have "any" permission
  if (isOwner && resource === 'project') {
    return hasPermission(userPermissions, permission) ||
           hasPermission(userPermissions, PERMISSIONS.EDIT_ANY_PROJECT);
  }

  if (isOwner && resource === 'task') {
    return hasPermission(userPermissions, permission) ||
           hasPermission(userPermissions, PERMISSIONS.EDIT_ANY_TASK);
  }

  return hasPermission(userPermissions, permission);
};

export default {
  PERMISSIONS,
  hasPermission,
  canPerform
};
