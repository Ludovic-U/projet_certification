const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { getClients, getClientById, createClient, updateClient, deleteClient } = require('../services/clientService');

module.exports.getClients = async (req, res) => { 
    user = req.user;  // assuming req.user is populated by authentication middleware
    try {
        const clients = await getClients(req.user);
       res.status(200).json(clients) 
    } catch (error) {
        res.status(error.status || 500).json({ error : `Error fetching clients ${error.message}` });
    }
}

module.exports.getClientById = async (req, res) => {
    user = req.user;  // assuming req.user is populated by authentication middleware
    const clientId = Number(req.params.clientId);  
    if (isNaN(clientId)) {
         res.status(400).json({ error: "Client not found" });
    }   
    try {
        const client = await getClientById(user, clientId);
        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }   
        res.status(200).json(client);
    } catch (error) {
        console.error('Error fetching client by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports.createClientPost = async (req, res) => {
    user = req.user; // assuming req.user is populated by authentication middleware
    const { clientName, secteur, statusJuridique, description } = req.body;
    if (!clientName) {
        console.log("Missing required field: clientName");
        return res.status(400).json({ error: "Missing required field: clientName" });
    }
    try {
        await createClient(user, clientName, secteur, statusJuridique, description);
        res.status(200).json({message: "client created"});
    } catch (error) {
        console.log(error)
        console.error('Error creating client:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Un client avec ce nom existe déjà.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports.updateClientPost = async (req, res) => { 
    user = req.user; 
    const clientId = Number(req.params.clientId);
    if (isNaN(clientId)) {
        return res.status(400).json({ error: "Invalid clientId" });
    }   
    const { clientName, secteur, statusJuridique, description } = req.body;
    try {
        const client = await updateClient(clientId, { clientName, secteur, statusJuridique, description });
        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }   
        res.status(200).json(client);
    } catch (error) {
        console.error('Error updating client:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Un client avec ce nom existe déjà.' });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }   
}

module.exports.deleteClientPost = async (req, res) => {
    user = req.user; // assuming req.user is populated by authentication middleware
    const clientId = Number(req.params.clientId);   
    if (isNaN(clientId)) {
        return res.status(400).json({ error: "Invalid clientId" });
    }   
    try {
        // TODO: call the service // ATTENTION DELETE CASCADE 
        res.status(403).json({ error: 'Cette opération n\' est pas permise pour l\'instant.' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
