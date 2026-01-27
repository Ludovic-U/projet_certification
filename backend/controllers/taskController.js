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
 * Expects the following fields in req.body:
 * - name: String
 * - description: String (optional)
 * - clientId: Number
 * Responds with the created task object.
 *
 * Example request body:
 * {
 *   "name": "New task",
 *  "description": "task description",
 *  "clientId": 1
 * }
 * */
module.exports.createtaskPost = async (req, res) => {
  // TODO: check permissions selon req.user ou rôle
  try {
    const data = {
      taskName: req.body.taskName,
      taskManager: parseInt(req.body.taskManager, 10),
      taskDesc: req.body.taskDesc,
      clientId: parseInt(req.body.clientId, 10),
      startDate: req.body.startDate,
      types: req.body.types || [],
      taskFile: req.body.taskFile,
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
 * Expects taskId in req.params and updated fields in req.body.
 * Responds with the updated task.
 *
 * Example request body:
 * {
 *   "name": "Updated task Name",
 *  "description": "Updated description"
 * }
 * */
module.exports.updatetaskPost = async (req, res) => {
  const taskId = Number(req.params.taskId);
  // Validate taskId
  if (!validateId(taskId, "taskId", res)) return;
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Un nom est requis" });
  }
  try {
    const task = await task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ error: "Tâche introuvable" });
    }
    task.name = name;
    task.description = description;
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de tâche:", error);
    res.status(500).json({ error: "Erreur Serveur" });
  }
};

/**
 * Delete a task by ID.
 * Expects taskId in req.params.
 * Responds with the deleted task object.
 * */
module.exports.deletetaskPost = async (req, res) => {
  const taskId = Number(req.params.taskId);
  // Validate taskId
  if (!validateId(taskId, "taskId", res)) return;
  try {
    const task = await task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ error: "Tâche introuvable" });
    }
    await task.destroy();
    res.status(200).json(task);
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Erreur Serveur" });
  }
};

/**
 * Get a task by ID.
 * Expects taskId in req.params.
 * Responds with the task object.
 * */
module.exports.gettaskById = async (req, res) => {
  const taskId = Number(req.params.taskId);
  // Validate taskId
  if (!validateId(taskId, "taskId", res)) return;
  try {
    const task = await task.findByPk(taskId);
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
 * Responds with an array of task objects.
 * */
module.exports.getAlltasks = async (req, res) => {
  try {
    const tasks = await getAlltasks();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Erreur Serveur" });
  }
};
/**
 * Get tasks by client ID.
 * Expects clientId in req.params.
 * Responds with an array of task objects.
 * */
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
 * Expects userId in req.params.
 * Responds with an array of task objects.
 * */
module.exports.gettasksByUserId = async (req, res) => {
  const userId = Number(req.params.userId);
  // Validate userId
  if (!validateId(userId, "userId", res)) return;
  try {
    const tasks = await task.findAll({ where: { userId } });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks by userId:", error);
    res.status(500).json({ error: "Erreur Serveur" });
  }
};

/**
 * Get tasks by name (partial match).
 * Expects name in req.params.
 * Responds with an array of task objects.
 * */
module.exports.gettasksByName = async (req, res) => {
  const name = req.params.name;
  if (!name) {
    return res.status(400).json({ error: "name parameter is required" });
 }
  try {
    const tasks = await task.findAll({
      where: {
        name: {
          [Op.iLike]: `%${name}%`,
        },
      },
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks by name:", error);
    res.status(500).json({ error: "Erreur Serveur" });
  }
};

/**
 * Update SWOT analysis for a task
 * Expects taskId in req.params and SWOT data in req.body
 * Responds with the updated SWOT data
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

    const updatedtask = await updatetaskSwot(taskId, swotData);
    res.status(200).json(updatedtask);
  } catch (error) {
    console.error("Error updating task SWOT:", error);
    res.status(500).json({ error: "Erreur Serveur" });
  }
};

/**
 * Get SWOT analysis for a task
 * Expects taskId in req.params
 * Responds with the SWOT data
 */
module.exports.gettaskSwotGet = async (req, res) => {
  const taskId = Number(req.params.taskId);
  if (!validateId(taskId, "taskId", res)) return;
  
  try {
    const task = await gettaskSwot(taskId);
    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task SWOT:", error);
    if (error.message === "task not found") {
      return res.status(404).json({ error: "task not found" });
    }
    res.status(500).json({ error: "Erreur Serveur" });
  }
}
