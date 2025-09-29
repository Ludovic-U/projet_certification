

module.exports.assignRoleToUser = async ( askingUser, userId, roleName ) => {
    // si user a déjà un role, throw error
    const userRoles = await prisma.userRole.findMany({
        where: { userId: userId },
    });
    if (userRoles.length > 0) {
        throw new Error('User already has a role assigned');
    }

    // si l'utilisateur qui demande n'a pas la permission, throw error

    // 
  const role = await prisma.role.findFirst({
    where: { roleName: roleName },
  });

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