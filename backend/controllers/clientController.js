const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();




module.exports.createClient = async (req, res) => {
    user = req.user; // assuming req.user is populated by authentication middleware
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

module.exports.getClients = async (req, res) => { //TODO: appeler clientService
    user = req.user;
    if (!user.permissisons.includes('client:read:any')){
        throw new Error('getClient : Unauthorized');
    }
    try {
        const clients = await prisma.client.findMany();
       return clients
    } catch (error) {
        res.status(500).json({ error : `Error fetching clients ${error.message}` });
    }
}

module.exports.getClientById = async (req, res) => {
    user = req.user;
    if (!user.permissisons.includes('client:read:any')){
        throw new Error('getClientById : Unauthorized');
    }   
    const clientId = Number(req.params.clientId);   
    if (isNaN(clientId)) {
        return res.status(400).json({ error: "Invalid clientId" });
    }   
    try {
        const client = await prisma.client.findUnique({
            where: { id: clientId },
        }); 
        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }   
        res.status(200).json(client);
    } catch (error) {
        console.error('Error fetching client by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports.deleteClient = async (req, res) => {
    user = req.user;
    if (!user.permissisons.includes('client:delete:any')){
        throw new Error('deleteClient : Unauthorized');
    }   
    const clientId = Number(req.params.clientId);   
    if (isNaN(clientId)) {
        return res.status(400).json({ error: "Invalid clientId" });
    }   
    try {
        const client = await prisma.client.delete({
            where: { id: clientId },
        });

        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }   
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports.updateClient = async (req, res) => { 
    user = req.user;
    if (!user.permissisons.includes('client:update:any')){
        throw new Error('updateClient : Unauthorized');
    }   
    const clientId = Number(req.params.clientId);
    if (isNaN(clientId)) {
        return res.status(400).json({ error: "Invalid clientId" });
    }   
    const { name, type, desc } = req.body;
    try {
        const client = await prisma.client.update({ 
            where: { id: clientId },
            data: {
                clientName : name,
                clientType :type,
                description : desc
            }
        }); 
        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }   
        res.status(200).json(client);
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }   
}
