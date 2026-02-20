const express = require('express');
const router = express.Router();
const mindmapController = require('../controllers/mindmapController');

// Save mindmap nodes as Tasks
router.post('/project/:projectId/save-as-tasks', mindmapController.saveAsTasks);

// Import mindmap nodes to Gantt chart
router.post('/project/:projectId/import-to-gantt', mindmapController.importToGantt);

// Save mindmap as Pre-project version for Gantt chart
router.post('/project/:projectId/save-as-preproject', mindmapController.saveAsPreProjectVersion);

// ==================== VERSION ROUTES ====================

// Get all mindmaps for a project (includes version info)
router.get('/project/:projectId/mindmaps', mindmapController.getMindmaps);

// Get a single mindmap by ID
router.get('/mindmaps/:mindmapId', mindmapController.getMindmap);

// Get mindmap by version ID
router.get('/version/:versionId/mindmap', mindmapController.getMindmapByVersion);

// Create a new mindmap
router.post('/project/:projectId/mindmaps', mindmapController.createMindmap);

// Update a mindmap (with nodes and edges)
router.put('/mindmaps/:mindmapId', mindmapController.updateMindmap);

// Delete a mindmap
router.delete('/mindmaps/:mindmapId', mindmapController.deleteMindmap);

// Save mindmap with a specific version
router.post('/project/:projectId/version/:versionId/save', mindmapController.saveMindmapWithVersion);

// Duplicate mindmap for a new version
router.post('/version/:sourceVersionId/duplicate-to/:targetVersionId', mindmapController.duplicateMindmapForVersion);

// Save mindmap nodes as Tasks (with version support)
router.post('/project/:projectId/save-as-tasks', mindmapController.saveAsTasks);

// Import mindmap nodes to Gantt chart
router.post('/project/:projectId/import-to-gantt', mindmapController.importToGantt);

// Save mindmap as Pre-project version for Gantt chart
router.post('/project/:projectId/save-as-preproject', mindmapController.saveAsPreProjectVersion);

module.exports = router;
