const permissions = {
  admin: {
    viewUsers: true,
    manageUsers: true,
    viewAllProjects: true,
    viewOwnProjects: true,
    createProject: true,
    editAnyProject: true,
    editOwnProject: true,
    deleteAnyProject: true,
    deleteOwnProject: true,
    createTask: true,
    editTask: true,
    deleteTask: true,
    changePassword: true,
    viewSettings: true
  },
  manager: {
    viewUsers: true,
    manageUsers: false,
    viewAllProjects: true,
    viewOwnProjects: true,
    createProject: true,
    editAnyProject: true,
    editOwnProject: true,
    deleteAnyProject: false,
    deleteOwnProject: true,
    createTask: true,
    editTask: true,
    deleteTask: true,
    changePassword: true,
    viewSettings: true
  },
  'team lead': {
    viewUsers: false,
    manageUsers: false,
    viewAllProjects: true,
    viewOwnProjects: true,
    createProject: true,
    editAnyProject: false,
    editOwnProject: true,
    deleteAnyProject: false,
    deleteOwnProject: true,
    createTask: true,
    editTask: true,
    deleteTask: true,
    changePassword: true,
    viewSettings: true
  },
  developer: {
    viewUsers: false,
    manageUsers: false,
    viewAllProjects: false,
    viewOwnProjects: true,
    createProject: false,
    editAnyProject: false,
    editOwnProject: false,
    deleteAnyProject: false,
    deleteOwnProject: false,
    createTask: true,
    editTask: true,
    deleteTask: false,
    changePassword: true,
    viewSettings: true
  },
  viewer: {
    viewUsers: false,
    manageUsers: false,
    viewAllProjects: false,
    viewOwnProjects: true,
    createProject: false,
    editAnyProject: false,
    editOwnProject: false,
    deleteAnyProject: false,
    deleteOwnProject: false,
    createTask: false,
    editTask: false,
    deleteTask: false,
    changePassword: true,
    viewSettings: true
  }
};

const getPermissions = (role) => {
  return permissions[role.toLowerCase()] || permissions.viewer;
};

const hasPermission = (role, permission) => {
  const userPermissions = getPermissions(role);
  return userPermissions[permission] || false;
};

module.exports = {
  permissions,
  getPermissions,
  hasPermission
};
