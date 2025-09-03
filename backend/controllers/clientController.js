const { PrismaClient } = require('@prisma/client');
const { isAdmin } = require('../utils/roles');
const prisma = new PrismaClient();




module.exports.createClient = async (req, res) => {
    user = req.user;
    if (!user.permissisons.includes('client:create:any')){
        throw new Error('createClient : Unauthorized');
    }
    const { name, type, desc } = req.body;
    try {
        const client = await prisma.client.create({
            data: {
                clientName : name,
                clientType :type,
                description : desc
            }
        });
        res.status(201).json(client);
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports.getClients = async (req, res) => {
    user = req.user;
    if (!user.permissisons.includes('client:read:any')){
        throw new Error('getClient : Unauthorized');
    }
    try {
        const clients = await prisma.client.findMany();
       return clients
    } catch (error) {
        throw new Error('Error fetching clients', error.message);
    }
}