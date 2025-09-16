// Made a simple projectController
// TODO: Added missing methods

const projectService = require("../services/projectService");
const { validateId } = require("./helpers/validateId");

module.exports.createProject = async (req, res) => {
  const { projectName, types, questions } = req.body;

  try {
    const project = await projectService.createProject({
      projectName,
      types: types ?? [],
      questions: questions ?? [],
    });
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.getAllProjects = async (_, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// TODO: update

module.exports.deleteProject = async (req, res) => {
  const projectId = Number(req.params.projectId);
  // Validate projectId
  if (!validateId(projectId, "projectId", res)) return;

  try {
    await projectService.deleteProject(projectId);
    res.status(204).send();
  } catch (error) {
    if (error.message === "Project not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.getProjectById = async (req, res) => {
  const projectId = Number(req.params.projectId);
  // Validate projectId
  if (!validateId(projectId, "projectId", res)) return;

  try {
    const project = await projectService.getProjectById(projectId);
    res.status(200).json(project);
  } catch (error) {
    if (error.message === "Project not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
