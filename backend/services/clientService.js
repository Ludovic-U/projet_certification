// const prisma = require('../prisma/prismaClient');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { checkPermission } = require('../utils/roles');


// TODO: create functions getClients, getClientById, createClient, updateClient, deleteClient
module.exports.getClients = async (askingUser) => {
    checkPermission(askingUser, 'client:read:any'); //TODO: add to db seed
    return await prisma.client.findMany();
}

module.exports.getClientById = async (askingUser, clientId) => {
    checkPermission(askingUser, ['client:read:any', 'client:read:org', 'client:read:own']);

    const hasAny = askingUser.permissions.includes('client:read:any');
    const hasOrg = askingUser.permissions.includes('client:read:org');
    const hasOwn = askingUser.permissions.includes('client:read:own');

    if (hasAny) {
        return await prisma.client.findUnique({
            where: { clientId: clientId },
        });
    }

    if (hasOrg && askingUser.clientId === clientId) {
        return await prisma.client.findUnique({
            where: { clientId: clientId },
        });
    }

    // For client:read:own, check if user has projects under this client
    if (hasOwn) {
        // Check if user is project manager or has tasks assigned for projects under this client
        const userProjects = await prisma.project.findMany({
            where: {
                clientId: clientId,
                OR: [
                    { projectManager: askingUser.userId },
                    {
                        tasks: {
                            some: {
                                taskAssignments: {
                                    some: { userId: askingUser.userId }
                                }
                            }
                        }
                    }
                ]
            },
            select: { projectId: true }
        });

        if (userProjects.length > 0) {
            return await prisma.client.findUnique({
                where: { clientId: clientId },
            });
        }
    }

    throw new Error('getClientById: Unauthorized');    
}

module.exports.createClient = async (askingUser, clientName, secteur, statusJuridique, description) => {
    checkPermission(askingUser, 'client:create');

    return await prisma.client.create({
        data: {
            clientName,
            secteur,
            statusJuridique,
            description
        }
    });
}

module.exports.updateClient = async (clientId, { clientName, secteur, statusJuridique, description }) => {
    return await prisma.client.update({
        where: { clientId },    
        data: {
            clientName,
            secteur,
            statusJuridique,
            description
        }
    });
}

module.exports.deleteClient = async (clientId) => {
    return await prisma.client.delete({
        where: { clientId },
    });
}

