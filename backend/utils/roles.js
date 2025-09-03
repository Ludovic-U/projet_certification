// RBAC (Role-Based Access Control) contextualisé
// permissions et rôles -> définis dans prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.hasPermissionTo = (userPermissions, permission) => {
  // Check if the user has a role that grants the permission
    if ( userPermissions.includes(permission)) {
      return true; // User has the permission 
    }  

  return false; // User does not have the permission
}








// Obsolete functions, kept for reference

module.exports.isAdmin = (user) => {
  if (user && user.roles.includes('admin')) {
    return true; // User is admin
  }
  return false; // User is not admin
}
module.exports.isManager = (user) => {
  if (user && user.roles.includes('manager')) {
    return true; // User is manager
  }
  return false; // User is not manager
}
module.exports.isProjectManager = (user) => {
  if (user && user.roles.includes('project_manager')){
    return true; // User is project manager
  }
  return false; // User is not project manager
}