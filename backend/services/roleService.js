const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { canAttributeRole } = require("../utils/roles");

module.exports.getAllRoles = async () => {
    const roles = await prisma.role.findMany();
    return roles;
}

module.exports.getUserRole = async (userId) => {
    return await prisma.userRole.c({
        where: { userId: askingUser.userId },
        include: { role: true }
    });
}

module.exports.assignRoleToUser = async ( askingUser, userId, roleName ) => {
    // si user a déjà un role, throw error
    const userRoles = await prisma.userRole.findMany({
        where: { userId: userId },
    });
    if (userRoles.length > 0) {
        throw new Error('User already has a role assigned');
    }

    const askingUserRole = await prisma.userRole.findFirst({
        where: { userId: askingUser.userId },
        include: { role: true }
    });

    // si l'utilisateur qui demande n'a pas la permission, throw error
    if (canAttributeRole(askingUserRole.role.roleName, roleName) === false) {
        throw new Error('assignRoleToUser: Unauthorized - cannot assign this role');
    }

    // retrieve role by name
    const role = await prisma.role.findFirst({
      where: { roleName: roleName },
    });

    // assign role to user
    if (role) {
    await prisma.userRole.create({
      data: {
        userId: userId,
        roleId: role.roleId,
      },
    });
  } else {
    throw new Error('Role not found');
  }
    return role;
}