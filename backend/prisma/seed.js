const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // liste de permissions de base
  "user:create:any",  "user:read:any", "user:update:any", "user:delete:any"
  const permissions = [
    //super admin
    { permName: "view_super_admin_dashboard", permDesc: "Voir le dahsboard super_admin" },
    { permName: "user:create:any", permDesc: "Créer n'importe quel utilisateur" },
    { permName: "user:read:any", permDesc: "Voir n'importe quel utilisateur" },
    { permName: "user:update:any", permDesc: "Modifier n'importe quel utilisateur" },
    { permName: "user:delete:any", permDesc: "Créer n'importe quel utilisateur" },
    { permName: "client:create", permDesc: "Créer un client" },
    { permName: "client:update", permDesc: "Modifier un client" },
    { permName: "clientUserRole:update:any", permDesc: "Modifier le rôle d'un utilisateur" },
    { permName: "project:create:any", permDesc: "Créer un projet pour n'importe quel client" },
    { permName: "project:read:any", permDesc: "Voir n'importe quel projet" },
    { permName: "project:update:any", permDesc: "Modifier n'importe quel projet" },
    { permName: "project:delete:any", permDesc: "Supprimer n'importe quel projet" },
    //admin client
    { permName: "user:create:org", permDesc: "Créer un utilisateur lié au client" },
    { permName: "user:read:org", permDesc: "Voir les utilisateurs liés au client" },
    { permName: "user:update:org", permDesc: "Modifier les utilisateurs liés au client" },
    { permName: "user:delete:org", permDesc: "Supprimer les utilisateurs liés au client" },
    { permName: "project:create:org", permDesc: "Créer un projet" },
    { permName: "project:read:org", permDesc: "Voir les projets liés au client" },
    { permName: "project:update:org", permDesc: "Modifier les projets liés au client" },
    { permName: "project:delete:org", permDesc: "Supprimer les projets liés au client" },
    { permName: "clientUserRole:update:org", permDesc: "Modifier le rôle d'un utilisateur lié au client" },
    //chef de projet
    { permName: "user:read:proj", permDesc: "Voir les utilisateurs liés à un projet" },
    { permName: "user:update:proj", permDesc: "Assigner les utilisateurs à des taches" },
    { permName: "project:read:own", permDesc: "Voir ses projets" },
    { permName: "project:update:own", permDesc: "Modifier ses projets" },

    
  ];

  //Upsert des permissions dans la base de données
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { permName: perm.permName },
      update: {},   // rien à mettre à jour (ou tu peux mettre permDesc si tu veux)
      create: perm,
    });
  }

  // Liste des rôles de base
  const rolesList = [
    { roleName: "super_admin", roleDesc: "Accès complet" },
    { roleName: "admin_client", roleDesc: "Accès son organisation" },
    { roleName: "chef_de_projet", roleDesc: "Accès à ses projets" },
    { roleName: "contributeur", roleDesc: "Rapporte ses info sans accès à l'application" }

  ];
  // Upsert des rôles dans la base de données
  for (const role of rolesList) {
    await prisma.role.upsert({
      where: { roleName: role.roleName },
      update: {},
      create: role
    });
  }

  // Matrice rôle -> permissions
  const rolePermissionsMatrix = {
    super_admin: ["view_super_admin_dashboard", "user:create:any", "user:read:any", "user:update:any", "user:delete:any", 
    "client:create", "client:update", "clientUserRole:update:any",
    "project:create:any", "project:read:any", "project:update:any", "project:delete:any"
    ],
    admin_client: ["user:create:org", "user:read:org", "user:update:org", "user:delete:org",
    "project:create:org", "project:read:org", "project:update:org", "project:delete:org",
    "clientUserRole:update:org"
  ],
    chef_de_projet: ["user:read:proj", "user:update:proj", "project:read:own", "project:update:own", 
  ],
    contributeur: [] // rapporte ses info sans accès à l'application
  };

    // Lier automatiquement chaque rôle à ses permissions
  for (const [roleName, permNames] of Object.entries(rolePermissionsMatrix)) {
    const role = await prisma.role.findUnique({ where: { roleName } });
    const perms = await prisma.permission.findMany({
      where: { permName: { in: permNames } }
    });

    for (const perm of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permId: { roleId: role.roleId, permId: perm.permId } },
        update: {},
        create: { roleId: role.roleId, permId: perm.permId }
      });
    }
  }
}


main()
  .then(() => console.log("Seeding terminé ✅"))
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect()
  });