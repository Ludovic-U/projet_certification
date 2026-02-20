const mindmapService = require('../services/mindmapService');
const { asyncErrorHandler } = require('./helpers/asyncErrorHandler');
const { prisma } = require('../prisma/prismaClient');

/**
 * Get all mindmaps for a project
 */
const getMindmaps = asyncErrorHandler(async (req, res) => {
  const { projectId } = req.params;
  const mindmaps = await mindmapService.getMindmapsForProject(parseInt(projectId));
  res.status(200).json(mindmaps);
});

/**
 * Get a single mindmap by ID
 */
const getMindmap = asyncErrorHandler(async (req, res) => {
  const { mindmapId } = req.params;
  const mindmap = await mindmapService.getMindmapById(parseInt(mindmapId));
  
  if (!mindmap) {
    return res.status(404).json({ error: 'Mindmap not found' });
  }
  
  res.status(200).json(mindmap);
});

/**
 * Get a mindmap by version ID
 */
const getMindmapByVersion = asyncErrorHandler(async (req, res) => {
  const { versionId } = req.params;
  const mindmap = await mindmapService.getMindmapByVersion(parseInt(versionId));
  
  if (!mindmap) {
    return res.status(404).json({ error: 'Mindmap not found for this version' });
  }
  
  res.status(200).json(mindmap);
});

/**
 * Create a new mindmap
 */
const createMindmap = asyncErrorHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, versionId } = req.body;
  
  const mindmap = await mindmapService.createMindmap(parseInt(projectId), { name, versionId });
  res.status(201).json(mindmap);
});

/**
 * Update a mindmap with nodes and edges
 */
const updateMindmap = asyncErrorHandler(async (req, res) => {
  const { mindmapId } = req.params;
  const { name, nodes, edges } = req.body;
  
  const mindmap = await mindmapService.updateMindmap(parseInt(mindmapId), { name, nodes, edges });
  res.status(200).json(mindmap);
});

/**
 * Delete a mindmap
 */
const deleteMindmap = asyncErrorHandler(async (req, res) => {
  const { mindmapId } = req.params;
  
  await mindmapService.deleteMindmap(parseInt(mindmapId));
  res.status(200).json({ message: 'Mindmap deleted successfully' });
});

/**
 * Save mindmap with a specific version
 */
const saveMindmapWithVersion = asyncErrorHandler(async (req, res) => {
  const { projectId, versionId } = req.params;
  const { nodes, edges } = req.body;
  
  const mindmap = await mindmapService.saveMindmapWithVersion(
    parseInt(projectId),
    parseInt(versionId),
    nodes,
    edges
  );
  res.status(200).json(mindmap);
});

/**
 * Duplicate mindmap for a new version
 */
const duplicateMindmapForVersion = asyncErrorHandler(async (req, res) => {
  const { sourceVersionId, targetVersionId } = req.params;
  
  const mindmap = await mindmapService.duplicateMindmapForVersion(
    parseInt(sourceVersionId),
    parseInt(targetVersionId)
  );
  
  if (!mindmap) {
    return res.status(404).json({ error: 'No mindmap found to duplicate' });
  }
  
  res.status(201).json(mindmap);
});

/**
 * Save mindmap nodes as Tasks (upsert approach)
 * Updates existing tasks or creates new ones - preserves changes
 */
const saveAsTasks = asyncErrorHandler(async (req, res) => {
  const { projectId } = req.params;
  const { nodes, edges } = req.body;

  if (!nodes || !Array.isArray(nodes)) {
    return res.status(400).json({ error: 'Nodes array is required' });
  }

  const result = await mindmapService.saveMindmapAsTasks(
    parseInt(projectId),
    nodes,
    edges || []
  );

  res.status(201).json({
    message: 'Successfully saved mindmap nodes as tasks',
    tasksCreated: result.tasks.length,
  });
});

/**
 * Import mindmap nodes to Gantt chart (fresh import)
 * Deletes existing mindmap tasks and creates fresh ones
 */
const importToGantt = asyncErrorHandler(async (req, res) => {
  const { projectId } = req.params;
  const { nodes, edges } = req.body;

  if (!nodes || !Array.isArray(nodes)) {
    return res.status(400).json({ error: 'Nodes array is required' });
  }

  const result = await mindmapService.importMindmapAsTasks(
    parseInt(projectId),
    nodes,
    edges || []
  );

  res.status(201).json({
    message: 'Successfully imported mindmap to Gantt chart (existing tasks cleared)',
    tasksCreated: result.tasks.length,
  });
});

/**
 * Save mindmap as a Pre-project version for Gantt chart
 * Creates or updates a "Pre-project" version and saves all nodes as tasks within it
 */
const saveAsPreProjectVersion = asyncErrorHandler(async (req, res) => {
  const { projectId } = req.params;
  const { nodes, edges } = req.body;

  if (!nodes || !Array.isArray(nodes)) {
    return res.status(400).json({ error: 'Nodes array is required' });
  }

  const parsedProjectId = parseInt(projectId);

  // Find or create the Pre-project version
  let preProjectVersion = await prisma.version.findFirst({
    where: {
      projectId: parsedProjectId,
      name: 'Pre-project',
    },
  });

  if (!preProjectVersion) {
    // Create new Pre-project version
    preProjectVersion = await prisma.version.create({
      data: {
        projectId: parsedProjectId,
        name: 'Pre-project',
        description: 'Created from mindmap',
        isActive: false,
      },
    });
  } else {
    // Clear existing tasks and links for this version
    await prisma.taskLink.deleteMany({
      where: { versionId: preProjectVersion.versionId },
    });
    await prisma.task.deleteMany({
      where: { versionId: preProjectVersion.versionId },
    });
  }

  // Save mindmap nodes as tasks within the version
  const result = await mindmapService.saveMindmapAsTasks(
    parsedProjectId,
    nodes,
    edges || [],
    preProjectVersion.versionId
  );

  // Also save the mindmap itself with the version
  await mindmapService.saveMindmapWithVersion(
    parsedProjectId,
    preProjectVersion.versionId,
    nodes,
    edges
  );

  res.status(201).json({
    message: 'Successfully saved mindmap as Pre-project version',
    versionId: preProjectVersion.versionId,
    versionName: preProjectVersion.name,
    tasksCreated: result.tasks.length,
    linksCreated: result.links ? result.links.length : 0,
  });
});

module.exports = {
  getMindmaps,
  getMindmap,
  getMindmapByVersion,
  createMindmap,
  updateMindmap,
  deleteMindmap,
  saveMindmapWithVersion,
  duplicateMindmapForVersion,
  saveAsTasks,
  importToGantt,
  saveAsPreProjectVersion,
};
