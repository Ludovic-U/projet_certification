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
  updateProjectGoNogo,
  getProjectDecisions,
  updateProjectDecision,
  getProjectImpacts,
  updateProjectImpact,
  deleteProjectImpact,
} = require("../services/projectService");
const { validateId } = require("../middlewares/validateId");

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
  // TODO: check permissions selon req.user ou rôle
  try {
    const parsedManagerId = Number(req.body.projectManager);
    const projectManagerId = Number.isInteger(parsedManagerId)
      ? parsedManagerId
      : Number(req.user?.userId);
    if (!Number.isInteger(projectManagerId) || projectManagerId <= 0) {
      return res
        .status(400)
        .json({ error: "projectManager est requis ou invalide." });
    }

    const data = {
      projectName: req.body.projectName,
      projectManager: projectManagerId,
      projectDesc: req.body.projectDesc,
      clientId: parseInt(req.body.clientId, 10),
      startDate: req.body.startDate,
      types: req.body.types || [],
      newTypes: req.body.newTypes || [],
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
  try {
    const data = {
      projectName: req.body.projectName,
      projectManager: req.body.projectManager,
      projectDesc: req.body.projectDesc,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      projectStage: req.body.projectStage,
      projectStatus: req.body.projectStatus,
      types: req.body.types,
    };

    const updatedProject = await updateProject(projectId, data);
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    if (error.message === "Project not found") {
      return res.status(404).json({ error: "Project not found" });
    }
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
  } catch (error) {
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

    res.status(200).json(project);
  } catch (error) {
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
    const projects = await getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
/**
 * Get projects by client ID.
 * Expects clientId in req.params.
 * Responds with an array of project objects.
 * If user doesn't have project:read:any or project:read:org permission,
 * only returns projects where user is manager, assigned to tasks, or client manager.
 * */
module.exports.getProjectsByClientId = async (req, res) => {
  const clientId = Number(req.params.clientId);
  // Validate clientId
  if (!validateId(clientId, "clientId", res)) return;
  
  try {
    const user = req.user;
    const userPermissions = user?.permissions || [];
    
    console.log('User permissions:', userPermissions);
    
    // Check if user has permission to see all projects in the organization
    // super_admin and admin_client with org permissions can see all
    const hasFullAccess = userPermissions.includes('project:read:any') || 
                          userPermissions.includes('project:read:org');
    
    if (hasFullAccess) {
      // User has full access - return all projects for this client
      const projects = await ProjectsByClientId(clientId);
      return res.status(200).json(projects);
    }
    
    // User has limited access (chef_de_projet with project:read:own)
    // Only return projects they're assigned to
    const projects = await getProjectsByUserId(user.userId);
    
    // Filter by the requested clientId
    const filteredProjects = projects.filter(p => p.clientId === clientId);
    console.log('Filtered projects:', filteredProjects.map(p => p.projectName));
    res.status(200).json(filteredProjects);
  } catch (error) {
    console.error("Error fetching projects by clientId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get projects by user ID (accessible projects).
 * Returns projects where user is manager, assigned to tasks, or client manager.
 * GET /api/project/user/:userId
 */
module.exports.getProjectsByUserIdGet = async (req, res) => {
  const userId = Number(req.params.userId);
  
  if (!validateId(userId, "userId", res)) return;
  
  try {
    const projects = await getProjectsByUserId(userId);
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects by userId:', error);
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
          [Op.iLike]: `%${name}%`,
        },
      },
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects by name:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update SWOT analysis for a project
 * Expects projectId in req.params and SWOT data in req.body
 * Responds with the updated SWOT data
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
 * Expects projectId in req.params
 * Responds with the SWOT data
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

/**
 * Update go/nogo decision for a project
 * Expects projectId in req.params and goNogo in req.body
 * goNogo can be "go", "nogo", or null
 */
module.exports.updateProjectGoNogoPost = async (req, res) => {
  const projectId = Number(req.params.projectId);
  if (!validateId(projectId, "projectId", res)) return;

  const rawValue = req.body.goNogo;
  const normalized =
    typeof rawValue === "string" ? rawValue.trim().toLowerCase() : null;
  const goNogo = normalized === "" ? null : normalized;

  if (goNogo !== null && goNogo !== "go" && goNogo !== "nogo") {
    return res
      .status(400)
      .json({ error: "goNogo must be 'go', 'nogo', or null" });
  }

  try {
    const updatedProject = await updateProjectGoNogo(projectId, goNogo);
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error updating project go/nogo:", error);
    if (error.message === "Project not found") {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all decisions for a project
 * Expects projectId in req.params
 * Returns all feasibility decisions for the project
 */
module.exports.getProjectDecisionsGet = async (req, res) => {
  const projectId = Number(req.params.projectId);
  if (!validateId(projectId, "projectId", res)) return;

  try {
    const decisions = await getProjectDecisions(projectId);
    res.status(200).json(decisions);
  } catch (error) {
    console.error("Error fetching project decisions:", error);
    if (error.message === "Project not found") {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update or create a feasibility decision for a project
 * Expects projectId in req.params and decision data in req.body
 * {
 *   boardType: "faisabilite" | "strategique",
 *   decisionType: string,
 *   isApproved: boolean | null,
 *   pourquoi: string | null,
 *   decisionFinale: "go" | "nogo" | "pending" | null
 * }
 */
module.exports.updateProjectDecisionPost = async (req, res) => {
  const projectId = Number(req.params.projectId);
  if (!validateId(projectId, "projectId", res)) return;

  const { boardType, decisionType, isApproved, pourquoi, decisionFinale } = req.body;

  // Validate boardType
  const validBoards = ["faisabilite", "strategique"];
  if (boardType && !validBoards.includes(boardType)) {
    return res.status(400).json({
      error: `boardType must be one of: ${validBoards.join(", ")}`,
    });
  }

  // Validate decisionType if provided
  if (decisionType && typeof decisionType !== "string") {
    return res.status(400).json({ error: "decisionType must be a string" });
  }

  // Validate isApproved
  if (isApproved !== undefined && isApproved !== null && typeof isApproved !== "boolean") {
    return res.status(400).json({ error: "isApproved must be a boolean or null" });
  }

  // Validate decisionFinale
  if (decisionFinale !== undefined) {
    const validFinales = ["go", "nogo", "pending", null, ""];
    if (!validFinales.includes(decisionFinale) && typeof decisionFinale !== "string") {
      return res.status(400).json({ error: "decisionFinale must be 'go', 'nogo', 'pending', or null" });
    }
  }

  try {
    const decision = await updateProjectDecision(projectId, {
      boardType,
      decisionType,
      isApproved,
      pourquoi,
      decisionFinale: decisionFinale === "" ? null : decisionFinale,
    });
    res.status(200).json(decision);
  } catch (error) {
    console.error("Error updating project decision:", error);
    if (error.message === "Project not found") {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all impacts for a project
 * Expects projectId in req.params
 * Returns all impacts for the project
 */
module.exports.getProjectImpactsGet = async (req, res) => {
  const projectId = Number(req.params.projectId);
  if (!validateId(projectId, "projectId", res)) return;

  try {
    const impacts = await getProjectImpacts(projectId);
    res.status(200).json(impacts);
  } catch (error) {
    console.error("Error fetching project impacts:", error);
    if (error.message === "Project not found") {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update or create an impact row for a project
 * Expects projectId in req.params and impact data in req.body
 */
module.exports.updateProjectImpactPost = async (req, res) => {
  const projectId = Number(req.params.projectId);
  if (!validateId(projectId, "projectId", res)) return;

  const { id, rowOrder, resultatsAttendus, criteres, indicateurs, situationDepart, objectif } = req.body;

  try {
    const impact = await updateProjectImpact(projectId, {
      id,
      rowOrder,
      resultatsAttendus,
      criteres,
      indicateurs,
      situationDepart,
      objectif,
    });
    res.status(200).json(impact);
  } catch (error) {
    console.error("Error updating project impact:", error);
    if (error.message === "Project not found") {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete an impact row for a project
 * Expects projectId in req.params and impactId in req.params
 */
module.exports.deleteProjectImpactDelete = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const impactId = Number(req.params.impactId);
  
  if (!validateId(projectId, "projectId", res)) return;
  if (!validateId(impactId, "impactId", res)) return;

  try {
    await deleteProjectImpact(projectId, impactId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting project impact:", error);
    if (error.message === "Impact not found") {
      return res.status(404).json({ error: "Impact not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
