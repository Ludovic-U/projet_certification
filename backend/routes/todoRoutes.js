const { Router } = require('express');
const {
  createTodoPost,
  getTodosByProjectIdGet,
  updateTodoPut,
  deleteTodoDelete,
} = require('../controllers/todoController');
const { authenticateUser } = require('../middlewares/auth');

const router = Router();

// Create a new todo
router.post('/create', authenticateUser, createTodoPost);

// Get all todos for a project
router.get('/project/:projectId', authenticateUser, getTodosByProjectIdGet);

// Update a todo
router.put('/:todoId', authenticateUser, updateTodoPut);

// Delete a todo
router.delete('/:todoId', authenticateUser, deleteTodoDelete);

module.exports = router;
