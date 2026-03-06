// RBAC (Role-Based Access Control) contextualisé
// permissions et rôles -> définis dans prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const roleAttributionRules = { //TODO: ne pas coder en dur?
  "super_admin": ["super_admin", "admin_client", "chef_de_projet", "contributeur"],
  "admin_client": ["admin_client", "chef_de_projet", "contributeur"],
  "chef_de_projet": ["contributeur"],
  "contributeur": []
}

module.exports.canAttributeRole = (assigningUserRole, roleToAssign) => {
  const allowedRoles = roleAttributionRules[assigningUserRole];
  return allowedRoles.includes(roleToAssign);
}

// Exemple d'utilisation
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


/**
 * Check if user has super_admin role
 * @param {Object} user - User object with roles array
 * @returns {boolean} - True if user has super_admin role
 */
module.exports.isSuperAdmin = (user) => {
  if (!user || !user.roles) {
    return false;
  }
  return user.roles.includes('super_admin');
}

/**
 * Check if user has admin level access (super_admin or admin_client)
 * @param {Object} user - User object with roles array
 * @returns {boolean} - True if user has admin level access
 */
module.exports.isAdmin = (user) => {
  if (!user || !user.roles) {
    return false;
  }
  return user.roles.includes('super_admin') || user.roles.includes('admin_client');
}

/**
 * Check if user has chef_de_projet role
 * @param {Object} user - User object with roles array
 * @returns {boolean} - True if user has chef_de_projet role
 */
module.exports.isProjectManager = (user) => {
  if (!user || !user.roles) {
    return false;
  }
  return user.roles.includes('chef_de_projet');
}

/**
 * Check if user has contributeur role
 * @param {Object} user - User object with roles array
 * @returns {boolean} - True if user has contributeur role
 */
module.exports.isContributeur = (user) => {
  if (!user || !user.roles) {
    return false;
  }
  return user.roles.includes('contributeur');
}
