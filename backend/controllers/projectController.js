const prisma = require("../prisma/prismaClient");
const {
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectsByClientId,
  getProjectsByUserId,
  getProjectsByName,
  ProjectsByClientId,
  updateProjectSwot,
  getProjectSwot,
} = require("../services/projectService");
const { validateId } = require("../middlewares/validateId");

/**
 * Create a new project.
 */
module.exports.createProjectPost = async (req, res) => {
  try {
    const data = {
      projectName: req.body.projectName,
      projectManager: parseInt(req.body.projectManager, 10),
      projectDesc: req.body.projectDesc,
      clientId: parseInt(req.body.clientId, 10),
      startDate: req.body.startDate,
      types: req.body.types || [],
    };

    const newProject = await createProject(data);
    res.status(201).json(newProject);
  } catch (error) {
    console.error("Erreur lors de la création du projet :", error);
    res.status(500).json({ error: "Impossible de créer le projet." });
  }
};

/**
 * Update a project by ID.
 */
module.exports.updateProjectPost = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  // Validate projectId
  if (!validateId(projectId, "projectId", res)) return;
  
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }
  
  try {
    // FIXED: Use Prisma instead of Sequelize
    const project = await prisma.project.findUnique({
      where: { projectId: projectId }
    });
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Update project with Prisma
    const updatedProject = await prisma.project.update({
      where: { projectId: projectId },
      data: {
        projectName: name,
        projectDesc: description
      }
    });
    
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a project by ID.
 */
module.exports.deleteProjectPost = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  // Validate projectId
  if (!validateId(projectId, "projectId", res)) return;
  
  try {
    // FIXED: Use Prisma instead of Sequelize
    const project = await prisma.project.delete({
      where: { projectId: projectId }
    });
    
    res.status(200).json(project);
  } catch (error) {
    console.error("Error deleting project:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a project by ID.
 */
module.exports.getProjectById = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  // Validate projectId
  if (!validateId(projectId, "projectId", res)) return;
  
  try {
    // FIXED: Use imported function or Prisma directly
    const project = await getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all projects.
 */
module.exports.getAllProjects = async (req, res) => {
  try {
    const projects = await getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get projects by client ID.
 */
module.exports.getProjectsByClientId = async (req, res) => {
  const clientId = Number(req.params.clientId);
  
  // Validate clientId
  if (!validateId(clientId, "clientId", res)) return;
  
  try {
    // FIXED: Use the correct function name (ProjectsByClientId vs getProjectsByClientId)
    const projects = await ProjectsByClientId(clientId);
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects by clientId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get projects by user ID.
 */
module.exports.getProjectsByUserId = async (req, res) => {
  const userId = Number(req.params.userId);
  
  // Validate userId
  if (!validateId(userId, "userId", res)) return;
  
  try {
    // FIXED: Use Prisma instead of Sequelize
    const projects = await prisma.project.findMany({
      where: { 
        // Assuming you have a managerId field or similar
        // Adjust based on your actual schema
        projectManager: userId 
      }
    });
    
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects by userId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get projects by name (partial match).
 */
module.exports.getProjectsByName = async (req, res) => {
  const name = req.params.name;
  
  if (!name) {
    return res.status(400).json({ error: "name parameter is required" });
  }
  
  try {
    // FIXED: Use Prisma instead of Sequelize
    const projects = await prisma.project.findMany({
      where: {
        projectName: {
          contains: name,
          mode: 'insensitive' // Case-insensitive search
        }
      }
    });
    
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects by name:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update SWOT analysis for a project
 */
module.exports.updateProjectSwotPost = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  if (!validateId(projectId, "projectId", res)) return;
  
  try {
    const swotData = {
      SWOT_strength: req.body.SWOT_strength || req.body.strengths,
      SWOT_weakness: req.body.SWOT_weakness || req.body.weaknesses,
      SWOT_opportunity: req.body.SWOT_opportunity || req.body.opportunities,
      SWOT_threat: req.body.SWOT_threat || req.body.threats,
    };

    const updatedProject = await updateProjectSwot(projectId, swotData);
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error updating project SWOT:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get SWOT analysis for a project
 */
module.exports.getProjectSwotGet = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  if (!validateId(projectId, "projectId", res)) return;
  
  try {
    const project = await getProjectSwot(projectId);
    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project SWOT:", error);
    if (error.message === "Project not found") {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
