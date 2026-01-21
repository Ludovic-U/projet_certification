const express = require('express');
const router = express.Router();
const controller = require('../controllers/financeurController');
const { authenticateUser } = require('../middlewares/auth');
const { validateId } = require('../middlewares/validateId'); // vérifier et assainir les ID dans les paramètres de route

// Financeur CRUD
router.post('/', authenticateUser, controller.createFinanceur);
router.get('/', authenticateUser, controller.getAllFinanceurs);
router.get('/:financeurId', authenticateUser, validateId('financeurId'), controller.getFinanceurById);
router.put('/:financeurId', authenticateUser, validateId('financeurId'), controller.updateFinanceur);
router.delete('/:financeurId', authenticateUser, validateId('financeurId'), controller.deleteFinanceur);

// Project <-> Financeur relations
router.get('/projects/:projectId', authenticateUser, validateId('projectId'), controller.getFinanceursByProject);
router.post('/projects/:projectId', authenticateUser, validateId('projectId'), controller.addFinanceurToProject);
router.delete('/projects/:projectId/:financeurId', authenticateUser, validateId('projectId'), validateId('financeurId'), controller.removeFinanceurFromProject);

module.exports = router;
