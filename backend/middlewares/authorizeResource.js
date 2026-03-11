const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.authorizeResource = (resourceType) => {
    return async (req, res, next) => {
        const projectId = Number(req.params.projectId);
        const userId = req.user.userId;
        const userRoles = req.user.roles || [];
        const userPermissions = req.user.permissions || [] || [];

        // Admin users can access all projects
        if (userRoles.includes('super_admin') || userRoles.includes('admin_client')) {
            if (userPermissions.includes('project:read:any')) {
                return next();
            }
        }
        
        // Get the client's ID from the project first
        const project = await prisma.project.findUnique({
            where: { projectId: projectId },
            select: { clientId: true }
        });

        if (!project) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        // Check if user is part of the client
        const hasAccess = await prisma.clientUserRole.findFirst({
            where: {
                userId: userId,
                clientId: project.clientId
            }
        });

        // Check if user is project manager
        const isManager = await prisma.project.findFirst({
            where: {
                projectId: projectId,
                projectManager: userId
            }
        });

        // Check if user has task assignments in this project
        const hasTaskAssignment = await prisma.taskAssignment.findFirst({
            where: {
                userId: userId,
                task: {
                    projectId: projectId
                }
            }
        });

        if (!hasAccess && !isManager && !hasTaskAssignment) {
            return res.status(403).json({ message: 'Vous n\'avez pas d\'autorisation sur ce projet' });
        }

        next();
    };
};