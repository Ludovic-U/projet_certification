const { Router } = require('express');
const {
  getGanttData,
  createTask,
  updateTask,
  deleteTask,
  createTaskLink,
  deleteTaskLink,
  createDeliverable,
  getSubActions,
  bulkUpdateTasks
} = require('../controllers/ganttController');
const { authenticateUser } = require('../middlewares/auth');
const router = Router();

// All gantt routes require authentication
router.use(authenticateUser);

// GET /api/gantt/:projectId - Get all Gantt data for a project
router.get('/:projectId', getGanttData);

// GET /api/gantt/:projectId/subactions - Get subActions for task creation
router.get('/:projectId/subactions', getSubActions);

// POST /api/gantt/:projectId/tasks - Create a new task
router.post('/:projectId/tasks', createTask);

// PUT /api/gantt/:projectId/tasks/:taskId - Update a task
router.put('/:projectId/tasks/:taskId', updateTask);

// DELETE /api/gantt/:projectId/tasks/:taskId - Delete a task
router.delete('/:projectId/tasks/:taskId', deleteTask);

// PUT /api/gantt/:projectId/tasks/bulk - Bulk update tasks (for drag/drop)
router.put('/:projectId/tasks/bulk', bulkUpdateTasks);

// POST /api/gantt/:projectId/links - Create a new task link
router.post('/:projectId/links', createTaskLink);

// DELETE /api/gantt/:projectId/links/:linkId - Delete a task link
router.delete('/:projectId/links/:linkId', deleteTaskLink);

// POST /api/gantt/:projectId/deliverables - Create a new deliverable
router.post('/:projectId/deliverables', createDeliverable);

module.exports = router;
