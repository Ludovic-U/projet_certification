const express = require('express');
const router = express.Router();
const mindmapController = require('../controllers/mindmapController');

// Save mindmap nodes as Tasks
router.post('/project/:projectId/save-as-tasks', mindmapController.saveAsTasks);

// Import mindmap nodes to Gantt chart
router.post('/project/:projectId/import-to-gantt', mindmapController.importToGantt);

module.exports = router;
