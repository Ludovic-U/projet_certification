// RBAC (Role-Based Access Control) contextualisé
// permissions et rôles -> définis dans prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Exemple d’utilisation
// checkPermission(user, "project:create:any");
// checkPermission(user, ["project:create:any", "project:create:org"]); 

module.exports.checkPermission = (user, permissionsRequired) => {
  if (!user || !user.permissions) {
    throw new Error('checkPermission: no user or no permissions');
  }

  // Normalise en tableau
  const requiredList = Array.isArray(permissionsRequired)
    ? permissionsRequired
    : [permissionsRequired];

  // Vérifie si au moins une des permissions est présente
  const hasAtLeastOne = requiredList.some(p => user.permissions.includes(p));

  if (!hasAtLeastOne) {
    var error = new Error(`Unauthorized - requires one of: ${requiredList.join(', ')}`);
    error.status = 403; // Forbidden
  
    throw error;
  }
};





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