const { Router } = require('express');
const {
  createTodoPost,
  getTodosByProjectIdGet,
  updateTodoPut,
  deleteTodoDelete,
} = require('../controllers/todoController');
const { authenticateUser } = require('../middlewares/auth');
const { authorizeResource } = require('../middlewares/authorizeResource');
const { validateId } = require('../middlewares/validateId');

const router = Router();

// All todo routes require authentication
router.use(authenticateUser);

// Create a new todo - projectId in body, authorization in controller
router.post('/create', createTodoPost);

// Get all todos for a project - requires project authorization
router.get('/project/:projectId', authorizeResource('project'), validateId('projectId'), getTodosByProjectIdGet);

// Update a todo - authorization in controller (checks todo belongs to user's project)
router.put('/:todoId', validateId('todoId'), updateTodoPut);

// Delete a todo - authorization in controller
router.delete('/:todoId', validateId('todoId'), deleteTodoDelete);

module.exports = router;
