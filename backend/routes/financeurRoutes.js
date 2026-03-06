const express = require('express');
const router = express.Router();
const controller = require('../controllers/financeurController');
const { authenticateUser } = require('../middlewares/auth');
const { validateId } = require('../middlewares/validateId');
const { isSuperAdmin } = require('../middlewares/isAdmin');

// Financeur CRUD - super_admin only
router.post('/', authenticateUser, isSuperAdmin, controller.createFinanceur);
router.get('/', authenticateUser, isSuperAdmin, controller.getAllFinanceurs);
router.get('/:financeurId', authenticateUser, isSuperAdmin, validateId('financeurId'), controller.getFinanceurById);
router.put('/:financeurId', authenticateUser, isSuperAdmin, validateId('financeurId'), controller.updateFinanceur);
router.delete('/:financeurId', authenticateUser, isSuperAdmin, validateId('financeurId'), controller.deleteFinanceur);

// Project <-> Financeur relations
router.get('/projects/:projectId', authenticateUser, validateId('projectId'), controller.getFinanceursByProject);
router.post('/projects/:projectId', authenticateUser, validateId('projectId'), controller.addFinanceurToProject);
router.delete('/projects/:projectId/:financeurId', authenticateUser, validateId('projectId'), validateId('financeurId'), controller.removeFinanceurFromProject);

module.exports = router;
