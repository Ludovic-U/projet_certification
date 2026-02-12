const mindmapService = require('../services/mindmapService');
const { asyncErrorHandler } = require('./helpers/asyncErrorHandler');

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

module.exports = {
  saveAsTasks,
  importToGantt,
};
