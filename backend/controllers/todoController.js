const {
  createTodo,
  getTodosByProjectId,
  updateTodo,
  deleteTodo,
} = require("../services/todoService");
const { validateId } = require("../middlewares/validateId");

/**
 * Create a new todo
 * POST /api/todo/create
 * Body: { text, projectId, assignedTo?, deadline? }
 */
module.exports.createTodoPost = async (req, res) => {
  try {
    const data = {
      text: req.body.text,
      projectId: parseInt(req.body.projectId, 10),
      assignedTo: req.body.assignedTo ? parseInt(req.body.assignedTo, 10) : undefined,
      deadline: req.body.deadline,
    };

    if (!data.text || !data.text.trim()) {
      return res.status(400).json({ error: "Todo text is required" });
    }

    const newTodo = await createTodo(data);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all todos for a project
 * GET /api/todo/project/:projectId
 */
module.exports.getTodosByProjectIdGet = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  if (!validateId(projectId, "projectId", res)) return;

  try {
    const todos = await getTodosByProjectId(projectId);
    res.status(200).json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a todo
 * PUT /api/todo/:todoId
 * Body: { text?, completed?, assignedTo?, deadline? }
 */
module.exports.updateTodoPut = async (req, res) => {
  const todoId = Number(req.params.todoId);
  
  if (!validateId(todoId, "todoId", res)) return;

  try {
    const data = {
      text: req.body.text,
      completed: req.body.completed,
      assignedTo: req.body.assignedTo !== undefined ? 
        (req.body.assignedTo ? parseInt(req.body.assignedTo, 10) : null) : 
        undefined,
      deadline: req.body.deadline,
    };

    const updatedTodo = await updateTodo(todoId, data);
    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    if (error.message === "Todo not found") {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a todo
 * DELETE /api/todo/:todoId
 */
module.exports.deleteTodoDelete = async (req, res) => {
  const todoId = Number(req.params.todoId);
  
  if (!validateId(todoId, "todoId", res)) return;

  try {
    await deleteTodo(todoId);
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    if (error.message === "Todo not found") {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
