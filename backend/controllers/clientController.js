const { PrismaClient } = require('@prisma/client');
const { isAdmin } = require('../utils/roles');
const prisma = new PrismaClient();




module.exports.createClient = async (req, res) => {
    user = req.user;
    if (!isAdmin(user)) {
        return res.status(403).json({ error: 'Forbidden ADMIN ONLY!!!' });
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
    console.log(user);
    if (!isAdmin(user)) {
        return res.status(403).json({ error: 'Forbidden ADMIN ONLY!!!' });
    }
    try {
        const clients = await prisma.client.findMany();
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}