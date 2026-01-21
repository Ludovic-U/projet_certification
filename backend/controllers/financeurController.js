const {
  createFinanceur,
  getAllFinanceurs,
  getFinanceurById,
  updateFinanceur,
  deleteFinanceur,
  getFinanceursByProject,
  addFinanceurToProject,
  removeFinanceurFromProject,
} = require('../services/financeurService');

const { checkPermission } = require('../utils/roles');

/** Helper: basic positive integer validation */
const toPositiveInt = (value) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
};

/** Create a financeur
 * POST /financeurs
 * body: { FinanceurName }
 */
module.exports.createFinanceur = async (req, res) => {
  try {
    // Permission: require a permission, fallback to any authenticated user
    try {
      checkPermission(req.user, ['financeur:manage']);
    } catch (permErr) {
      return res.status(403).json({ error: permErr.message || 'Forbidden' });
    }

    const { FinanceurName } = req.body || {};
    if (!FinanceurName || typeof FinanceurName !== 'string') {
      return res.status(400).json({ error: 'FinanceurName is required and must be a string' });
    }

    const created = await createFinanceur(FinanceurName.trim());
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('createFinanceur error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/** Get all financeurs
 * GET /financeurs
 */
module.exports.getAllFinanceurs = async (req, res) => {
  try {
    const all = await getAllFinanceurs();
    return res.status(200).json({ success: true, data: all });
  } catch (error) {
    console.error('getAllFinanceurs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/** Get a financeur by id
 * GET /financeurs/:financeurId
 */
module.exports.getFinanceurById = async (req, res) => {
  try {
    const financeurId = toPositiveInt(req.params.financeurId);
    if (!financeurId) return res.status(400).json({ error: 'Invalid financeurId' });

    const found = await getFinanceurById(financeurId);
    if (!found) return res.status(404).json({ error: 'Financeur not found' });
    return res.status(200).json({ success: true, data: found });
  } catch (error) {
    console.error('getFinanceurById error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/** Update a financeur
 * PUT /financeurs/:financeurId
 * body: { FinanceurName }
 */
module.exports.updateFinanceur = async (req, res) => {
  try {
    try {
      checkPermission(req.user, ['financeur:manage']);
    } catch (permErr) {
      return res.status(403).json({ error: permErr.message || 'Forbidden' });
    }

    const financeurId = toPositiveInt(req.params.financeurId);
    if (!financeurId) return res.status(400).json({ error: 'Invalid financeurId' });

    const { FinanceurName } = req.body || {};
    if (!FinanceurName || typeof FinanceurName !== 'string') {
      return res.status(400).json({ error: 'FinanceurName is required and must be a string' });
    }

    const updated = await updateFinanceur(financeurId, { FinanceurName: FinanceurName.trim() });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('updateFinanceur error:', error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Financeur not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/** Delete a financeur
 * DELETE /financeurs/:financeurId
 */
module.exports.deleteFinanceur = async (req, res) => {
  try {
    try {
      checkPermission(req.user, ['financeur:manage']);
    } catch (permErr) {
      return res.status(403).json({ error: permErr.message || 'Forbidden' });
    }

    const financeurId = toPositiveInt(req.params.financeurId);
    if (!financeurId) return res.status(400).json({ error: 'Invalid financeurId' });

    const deleted = await deleteFinanceur(financeurId);
    return res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    console.error('deleteFinanceur error:', error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Financeur not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/** Get financeurs for a project
 * GET /projects/:projectId/financeurs
 */
module.exports.getFinanceursByProject = async (req, res) => {
  try {
    const projectId = toPositiveInt(req.params.projectId);
    if (!projectId) return res.status(400).json({ error: 'Invalid projectId' });

    const list = await getFinanceursByProject(projectId);
    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error('getFinanceursByProject error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/** Add or update a financeur relation to a project
 * POST /projects/:projectId/financeurs
 * body: { financeurId, pourcentage, montant }
 */
module.exports.addFinanceurToProject = async (req, res) => {
  try {
    try {
      checkPermission(req.user, ['financeur:manage']);
    } catch (permErr) {
      return res.status(403).json({ error: permErr.message || 'Forbidden' });
    }

    const projectId = toPositiveInt(req.params.projectId);
    const financeurId = toPositiveInt(req.body.financeurId || req.params.financeurId);
    const pourcentage = Number(req.body.pourcentage);
    const montant = Number(req.body.montant);

    if (!projectId || !financeurId) return res.status(400).json({ error: 'projectId and financeurId are required and must be positive integers' });
    if (!Number.isFinite(pourcentage) || Number.isNaN(pourcentage)) return res.status(400).json({ error: 'pourcentage is required and must be a number' });
    if (!Number.isFinite(montant) || Number.isNaN(montant)) return res.status(400).json({ error: 'montant is required and must be a number' });

    const relation = await addFinanceurToProject(projectId, financeurId, pourcentage, montant);
    return res.status(200).json({ success: true, data: relation });
  } catch (error) {
    console.error('addFinanceurToProject error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/** Remove a financeur from a project
 * DELETE /projects/:projectId/financeurs/:financeurId
 */
module.exports.removeFinanceurFromProject = async (req, res) => {
  try {
    try {
      checkPermission(req.user, ['financeur:manage']);
    } catch (permErr) {
      return res.status(403).json({ error: permErr.message || 'Forbidden' });
    }

    const projectId = toPositiveInt(req.params.projectId);
    const financeurId = toPositiveInt(req.params.financeurId);
    if (!projectId || !financeurId) return res.status(400).json({ error: 'projectId and financeurId are required and must be positive integers' });

    const deleted = await removeFinanceurFromProject(projectId, financeurId);
    return res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    console.error('removeFinanceurFromProject error:', error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Relation not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};
