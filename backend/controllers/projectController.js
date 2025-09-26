const prisma = require('../prisma/prismaClient');
const { createProject, getProjectById, updateProject, deleteProject, getAllProjects, getProjectsByClientId, getProjectsByUserId, getProjectsByName } = require('../services/projectService');
const { validateId } = require('./helpers/validateId');

/**
 * Create a new project.
 * Expects the following fields in req.body:
 * - name: String
 * - description: String (optional)
 * - clientId: Number
 * Responds with the created project object.
 *  
 * Example request body:
 * {
 *   "name": "New Project", 
 *  "description": "Project description",
 *  "clientId": 1
 * }
 * */
module.exports.createProjectPost = async (req, res) => {
    const { name, description, clientId } = req.body;
    if (!name || !clientId) {
        return res.status(400).json({ error: "name and clientId are required" });
    }
    try {
        const project = await Project.create({ name, description, clientId });
        res.status(201).json(project);
    }
    catch (error) {

        console.error("Error creating project:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Update a project by ID.
 * Expects projectId in req.params and updated fields in req.body.
 * Responds with the updated project.
 * 
 * Example request body:
 * {
 *   "name": "Updated Project Name", 
 *  "description": "Updated description"
 * }    
 * */
module.exports.updateProjectPost = async (req, res) => {
    const projectId = Number(req.params.projectId);
    // Validate projectId
    if (!validateId(projectId, "projectId", res)) return;  
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: "name is required" });
    }
    try {
        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        project.name = name;
        project.description = description;
        await project.save();
        res.status(200).json(project);
    }
    catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**    
 * Delete a project by ID.
 * Expects projectId in req.params.
 * Responds with the deleted project object.
 * */   
module.exports.deleteProjectPost = async (req, res) => {
    const projectId = Number(req.params.projectId); 
    // Validate projectId
    if (!validateId(projectId, "projectId", res)) return;
    try {
        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }   
        await project.destroy();
        res.status(200).json(project);
    }
    catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: "Internal server error" });
    }   
};

/**     
 * Get a project by ID.
 * Expects projectId in req.params.
 * Responds with the project object.
 * */
module.exports.getProjectById = async (req, res) => {
    const projectId = Number(req.params.projectId); 
    // Validate projectId
    if (!validateId(projectId, "projectId", res)) return;
    try {   
        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }



        res.status(200).json(project);    }
    catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ error: "Internal server error" });
    }   
};
/**
 * Get all projects.
 * Responds with an array of project objects.   
 * */   
module.exports.getAllProjects = async (req, res) => {   
    try {
        const projects = await Project.findAll();
        res.status(200).json(projects);
    }   
    catch (error) { 
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Internal server error" });
    }   
};  
/**
 * Get projects by client ID.
 * Expects clientId in req.params.  
 * Responds with an array of project objects.   
 * */   
module.exports.getProjectsByClientId = async (req, res) => {   
    const clientId = Number(req.params.clientId);
    // Validate clientId
    if (!validateId(clientId, "clientId", res)) return;
    try {   
        const projects = await Project.findAll({ where: { clientId } });
        res.status(200).json(projects);
    }   
    catch (error) { 
        console.error("Error fetching projects by clientId:", error);   
        res.status(500).json({ error: "Internal server error" });
    }   
};  

/**
 * Get projects by user ID.
 * Expects userId in req.params. 
 * Responds with an array of project objects.   
 * */
module.exports.getProjectsByUserId = async (req, res) => {   
    const userId = Number(req.params.userId);
    // Validate userId
    if (!validateId(userId, "userId", res)) return;
    try {   
        const projects = await Project.findAll({ where: { userId } });
        res.status(200).json(projects);
    }   
    catch (error) { 
        console.error("Error fetching projects by userId:", error);   
        res.status(500).json({ error: "Internal server error" });
    }
};  

/**     
 * Get projects by name (partial match).
 * Expects name in req.params.
 * Responds with an array of project objects.
 * */
module.exports.getProjectsByName = async (req, res) => {
    const name = req.params.name;
    if (!name) {
        return res.status(400).json({ error: "name parameter is required" });
    }   
    try {   
        const projects = await Project.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${name}%` 
                }
            }
        });
        res.status(200).json(projects);
    }       
    catch (error) {
        console.error("Error fetching projects by name:", error);
        res.status(500).json({ error: "Internal server error" });
    }   
};
