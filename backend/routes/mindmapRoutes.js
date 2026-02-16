const express = require('express');
const router = express.Router();
const mindmapController = require('../controllers/mindmapController');

// Save mindmap nodes as Tasks
router.post('/project/:projectId/save-as-tasks', mindmapController.saveAsTasks);

// Import mindmap nodes to Gantt chart
router.post('/project/:projectId/import-to-gantt', mindmapController.importToGantt);

// Save mindmap as Pre-project version for Gantt chart
router.post('/project/:projectId/save-as-preproject', mindmapController.saveAsPreProjectVersion);

module.exports = router;
