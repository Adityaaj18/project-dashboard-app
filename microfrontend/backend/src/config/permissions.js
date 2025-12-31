// Role-based permissions configuration

export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  TEAM_LEAD: 'Team Lead',
  DEVELOPER: 'Developer',
  VIEWER: 'Viewer'
};

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

// Role-to-permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Admins have all permissions
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.VIEW_ALL_PROJECTS,
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_ANY_PROJECT,
    PERMISSIONS.DELETE_ANY_PROJECT,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_ANY_TASK,
    PERMISSIONS.DELETE_ANY_TASK,
    PERMISSIONS.CHANGE_OWN_PASSWORD,
    PERMISSIONS.VIEW_SETTINGS
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ALL_PROJECTS,
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_ANY_PROJECT,
    PERMISSIONS.DELETE_ANY_PROJECT,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_ANY_TASK,
    PERMISSIONS.DELETE_ANY_TASK,
    PERMISSIONS.CHANGE_OWN_PASSWORD,
    PERMISSIONS.VIEW_SETTINGS
  ],

  [ROLES.TEAM_LEAD]: [
    PERMISSIONS.VIEW_ALL_PROJECTS,
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_OWN_PROJECT,
    PERMISSIONS.EDIT_ANY_TASK,
    PERMISSIONS.DELETE_OWN_PROJECT,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_ANY_TASK,
    PERMISSIONS.DELETE_OWN_TASK,
    PERMISSIONS.CHANGE_OWN_PASSWORD,
    PERMISSIONS.VIEW_SETTINGS
  ],

  [ROLES.DEVELOPER]: [
    PERMISSIONS.VIEW_OWN_PROJECTS,
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_OWN_PROJECT,
    PERMISSIONS.DELETE_OWN_PROJECT,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_OWN_TASK,
    PERMISSIONS.DELETE_OWN_TASK,
    PERMISSIONS.CHANGE_OWN_PASSWORD,
    PERMISSIONS.VIEW_SETTINGS
  ],

  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_OWN_PROJECTS,
    PERMISSIONS.VIEW_SETTINGS
  ]
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if a role can perform an action on a resource
 * @param {string} role - User role
 * @param {string} action - Action to perform (view, create, edit, delete)
 * @param {string} resource - Resource type (project, task, user)
 * @param {boolean} isOwner - Whether the user owns the resource
 * @returns {boolean}
 */
export const canPerformAction = (role, action, resource, isOwner = false) => {
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

  return hasPermission(role, permission);
};

export default {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  canPerformAction
};
