// RBAC (Role-Based Access Control) contextualisé
//Super_admin
  // "user:create:any",  "user:read:any", "user:update:any", "user:delete:any",  créer, supprimer les utilisateurs
  // modifier les droits des utilisateur
  // créer,modifier et supprimer les projets
  // avoir accés à tous les projets
  // avoir accés et pouvoir modifer les planning, budget, TOUT de tous les projets
  // créer, modifier, supprimer les taches et les sous-taches pour les projets
//Directeur
  // créer, modifier ses projets
  // créer, modifier, supprimer un chef de projet pour mes projets
  // avoir accés à mes projets
  // avoir accés et pouvoir modifer les planning et TOUT de mes projets 
  // avoir accés a la liste des contributeurs et pouvoir modifier leurs infos
  // créer, modifier, supprimer les taches et les sous-taches pour mes projets
//Chef de projet
  // modifier mes projets
  // ajouter des contributeurs à mes projets
  // avoir accés à mes projets
  // avoir accés et pouvoir modifer les planning de mes projets
  // avoir accés a la liste des contributeurs et pouvoir modifier leurs infos
  // créer, modifier, supprimer les taches et les sous-taches pour mes projets
//Contributeur
  // avoir accés à mes taches
  // ajouter mes heures de travail
  // avoir accés à un planning de mes taches
  // Lire les actions, sous-actions, livrables du projet

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.hasPermissionTo  = async (userId, permission, context = {}) => {
  if (!user || !user.roles) {
    return false; // User is not authenticated or has no roles
  }
  
  const userPermissions = await prisma.permission.findMany({
  where: {
      rolePermissions: {
        some: {
          role: {
            userRoles: {
              some: {
                userId: userId
              }
            }
          }
        }
      }
    }
  });

  // Check if the user has a role that grants the permission
    if ( userPermissions.includes(permission)) {
      return true; // User has the permission through a role
    }  

  return false; // User does not have the permission  
}

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