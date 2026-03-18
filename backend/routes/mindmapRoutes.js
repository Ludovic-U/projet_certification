const express = require('express');
const router = express.Router();
const mindmapController = require('../controllers/mindmapController');
const { authenticateUser } = require('../middlewares/auth');
const { authorizeResource } = require('../middlewares/authorizeResource');

// All mindmap routes require authentication AND authorization
router.use(authenticateUser);

// ==================== PROJECT SCOPED ROUTES ====================

// Save mindmap nodes as Tasks
router.post('/project/:projectId/save-as-tasks', authorizeResource('project'), mindmapController.saveAsTasks);

// Import mindmap nodes to Gantt chart
router.post('/project/:projectId/import-to-gantt', authorizeResource('project'), mindmapController.importToGantt);

// Save mindmap as Pre-project version for Gantt chart
router.post('/project/:projectId/save-as-preproject', authorizeResource('project'), mindmapController.saveAsPreProjectVersion);

// Get all mindmaps for a project (includes version info)
router.get('/project/:projectId/mindmaps', authorizeResource('project'), mindmapController.getMindmaps);

// Create a new mindmap
router.post('/project/:projectId/mindmaps', authorizeResource('project'), mindmapController.createMindmap);

// Save mindmap with a specific version
router.post('/project/:projectId/version/:versionId/save', authorizeResource('project'), mindmapController.saveMindmapWithVersion);

// ==================== MINDMAP ID ROUTES ====================

// Get a single mindmap by ID
router.get('/mindmaps/:mindmapId', mindmapController.getMindmap);

// Update a mindmap (with nodes and edges)
router.put('/mindmaps/:mindmapId', mindmapController.updateMindmap);

// Delete a mindmap
router.delete('/mindmaps/:mindmapId', mindmapController.deleteMindmap);

// ==================== VERSION ROUTES ====================

// Get mindmap by version ID
router.get('/version/:versionId/mindmap', mindmapController.getMindmapByVersion);

// Duplicate mindmap for a new version
router.post('/version/:sourceVersionId/duplicate-to/:targetVersionId', mindmapController.duplicateMindmapForVersion);

module.exports = router;
