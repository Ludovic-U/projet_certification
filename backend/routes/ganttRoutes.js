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
  bulkUpdateTasks,
  importGanttData,
  getVersions,
  createVersion,
  updateVersion,
  deleteVersion,
  activateVersion,
  createTaskDeliverable,
  updateTaskDeliverable,
  confirmTaskDeliverable,
  deleteTaskDeliverable,
  getTaskDeliverables
} = require('../controllers/ganttController');
const { authenticateUser } = require('../middlewares/auth');
const router = Router();

// All gantt routes require authentication
router.use(authenticateUser);

// GET /api/gantt/:projectId - Get all Gantt data for a project
router.get('/:projectId', getGanttData);

// GET /api/gantt/:projectId/subactions - Get subActions for task creation
router.get('/:projectId/subactions', getSubActions);

// GET /api/gantt/:projectId/versions - Get all versions for a project
router.get('/:projectId/versions', getVersions);

// POST /api/gantt/:projectId/versions - Create a new version
router.post('/:projectId/versions', createVersion);

// PUT /api/gantt/:projectId/versions/:versionId - Update a version
router.put('/:projectId/versions/:versionId', updateVersion);

// DELETE /api/gantt/:projectId/versions/:versionId - Delete a version
router.delete('/:projectId/versions/:versionId', deleteVersion);

// PUT /api/gantt/:projectId/versions/:versionId/activate - Set version as active
router.put('/:projectId/versions/:versionId/activate', activateVersion);

// POST /api/gantt/:projectId/tasks - Create a new task
router.post('/:projectId/tasks', createTask);

// PUT /api/gantt/:projectId/tasks/bulk - Bulk update tasks (for drag/drop)
// IMPORTANT: This must be defined BEFORE /:taskId route to avoid being matched as a taskId
router.put('/:projectId/tasks/bulk', bulkUpdateTasks);

// PUT /api/gantt/:projectId/tasks/:taskId - Update a task
router.put('/:projectId/tasks/:taskId', updateTask);

// DELETE /api/gantt/:projectId/tasks/:taskId - Delete a task
router.delete('/:projectId/tasks/:taskId', deleteTask);

// POST /api/gantt/:projectId/links - Create a new task link
router.post('/:projectId/links', createTaskLink);

// DELETE /api/gantt/:projectId/links/:linkId - Delete a task link
router.delete('/:projectId/links/:linkId', deleteTaskLink);

// POST /api/gantt/:projectId/deliverables - Create a new deliverable
router.post('/:projectId/deliverables', createDeliverable);

// Task Deliverable Routes
// GET /api/gantt/:projectId/tasks/:taskId/deliverables - Get all deliverables for a task
router.get('/:projectId/tasks/:taskId/deliverables', getTaskDeliverables);

// POST /api/gantt/:projectId/tasks/:taskId/deliverables - Create a new task deliverable
router.post('/:projectId/tasks/:taskId/deliverables', createTaskDeliverable);

// PUT /api/gantt/:projectId/tasks/:taskId/deliverables/:deliverableId - Update a task deliverable (upload file)
router.put('/:projectId/tasks/:taskId/deliverables/:deliverableId', updateTaskDeliverable);

// PUT /api/gantt/:projectId/tasks/:taskId/deliverables/:deliverableId/confirm - Confirm a task deliverable
router.put('/:projectId/tasks/:taskId/deliverables/:deliverableId/confirm', confirmTaskDeliverable);

// DELETE /api/gantt/:projectId/tasks/:taskId/deliverables/:deliverableId - Delete a task deliverable
router.delete('/:projectId/tasks/:taskId/deliverables/:deliverableId', deleteTaskDeliverable);

// POST /api/gantt/import/:projectId - Import Mistral JSON data
router.post('/import/:projectId', importGanttData);

module.exports = router;
