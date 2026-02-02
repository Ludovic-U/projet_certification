const prisma = require("../prisma/prismaClient");
const {
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTasks,
  getTasksByClientId,
  getTasksByUserId,
  getTasksByName,
  tasksByClientId,
  updateTaskSwot,
  getTaskSwot,
} = require("../services/taskService");
const { validateId } = require("../middlewares/validateId");

/**
 * Create a new task.
 */
module.exports.createtaskPost = async (req, res) => {
  try {
    const data = {
      taskName: req.body.taskName,
      taskDesc: req.body.taskDesc,
      clientId: parseInt(req.body.clientId, 10),
      projectId: parseInt(req.body.projectId, 10), // Add projectId
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      taskProgress: req.body.taskProgress || 0,
      taskParentId: req.body.taskParentId || 0,
      taskType: req.body.taskType || 'task',
    };

    const newTask = await createTask(data);
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Erreur lors de la création de la tâche :", error);
    res.status(500).json({ error: "Impossible de créer la tâche." });
  }
};

/**
 * Update a task by ID.
 */
module.exports.updatetaskPost = async (req, res) => {
  const taskId = Number(req.params.taskId);
  
  // Validate taskId
  if (!validateId(taskId, "taskId", res)) return;
  
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Un nom est requis" });
  }
  
  try {
    // FIXED: Use Prisma instead of Sequelize
    const task = await prisma.task.findUnique({
      where: { taskId: taskId }
    });
    
    if (!task) {
      return res.status(404).json({ error: "Tâche introuvable" });
    }
    
    // Update task with Prisma
    const updatedTask = await prisma.task.update({
      where: { taskId: taskId },
      data: {
        taskName: name,
        taskDesc: description
      }
    });
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de tâche:", error);
    res.status(500).json({ error: "Erreur Serveur" });
  }
};

/**
 * Delete a task by ID.
 */
module.exports.deletetaskPost = async (req, res) => {
  const taskId = Number(req.params.taskId);
  
  // Validate taskId
  if (!validateId(taskId, "taskId", res)) return;
  
  try {
    // FIXED: Use Prisma instead of Sequelize
    const task = await prisma.task.delete({
      where: { taskId: taskId }
    });
    
    res.status(200).json(task);
  } catch (error) {
    console.error("Error deleting task:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Tâche introuvable" });
    }
    res.status(500).json({ error: "Erreur Serveur" });
  }
};

/**
 * Get a task by ID.
 */
module.exports.gettaskById = async (req, res) => {
  const taskId = Number(req.params.taskId);
  
  // Validate taskId
  if (!validateId(taskId, "taskId", res)) return;
  
  try {
    const task = await getTaskById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: "Tâche introuvable" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Erreur Serveur" });
  }
};

/**
 * Get all tasks.
 */
module.exports.getAlltasks = async (req, res) => {
  try {
    const tasks = await getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Erreur Serveur" });
  }
};

/**
 * Get tasks by client ID.
 */
module.exports.gettasksByClientId = async (req, res) => {
  const clientId = Number(req.params.clientId);
  
  // Validate clientId
  if (!validateId(clientId, "clientId", res)) return;
  
  try {
    const tasks = await tasksByClientId(clientId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks by clientId:", error);
    res.status(500).json({ error: "Erreur Serveur" });
  }
};

/**
 * Get tasks by user ID.
 */
module.exports.gettasksByUserId = async (req, res) => {
  const userId = Number(req.params.userId);
  
  // Validate userId
  if (!validateId(userId, "userId", res)) return;
  
  try {
    // FIXED: Use Prisma instead of Sequelize
    // Assuming tasks are related to projects which have a manager
    // You need to adjust this based on your actual schema
    const tasks = await prisma.task.findMany({
      where: { 
        // This depends on how tasks relate to users in your schema
        // You might need to join through projects
      }
    });
    
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks by userId:", error);
    res.status(500).json({ error: "Erreur Serveur" });
  }
};

/**
 * Get tasks by name (partial match).
 */
module.exports.gettasksByName = async (req, res) => {
  const name = req.params.name;
  
  if (!name) {
    return res.status(400).json({ error: "name parameter is required" });
  }
  
  try {
    // FIXED: Use Prisma instead of Sequelize
    const tasks = await prisma.task.findMany({
      where: {
        taskName: {
          contains: name,
          mode: 'insensitive'
        }
      }
    });
    
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks by name:", error);
    res.status(500).json({ error: "Erreur Serveur" });
  }
};

/**
 * Update SWOT analysis for a task
 */
module.exports.updatetaskSwotPost = async (req, res) => {
  const taskId = Number(req.params.taskId);
  
  if (!validateId(taskId, "taskId", res)) return;
  
  try {
    const swotData = {
      SWOT_strength: req.body.SWOT_strength || req.body.strengths,
      SWOT_weakness: req.body.SWOT_weakness || req.body.weaknesses,
      SWOT_opportunity: req.body.SWOT_opportunity || req.body.opportunities,
      SWOT_threat: req.body.SWOT_threat || req.body.threats,
    };

    const updatedtask = await updateTaskSwot(taskId, swotData);
    res.status(200).json(updatedtask);
  } catch (error) {
    console.error("Error updating task SWOT:", error);
    res.status(500).json({ error: "Erreur Serveur" });
  }
};

/**
 * Get SWOT analysis for a task
 */
module.exports.gettaskSwotGet = async (req, res) => {
  const taskId = Number(req.params.taskId);
  
  if (!validateId(taskId, "taskId", res)) return;
  
  try {
    const task = await getTaskSwot(taskId);
    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task SWOT:", error);
    if (error.message === "task not found") {
      return res.status(404).json({ error: "task not found" });
    }
    res.status(500).json({ error: "Erreur Serveur" });
  }
};
