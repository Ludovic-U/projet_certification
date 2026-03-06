const { Router } = require('express')
const { createClientPost, getClients, getClientById, updateClientPost } = require('../controllers/clientController');
const { authenticateUser } = require('../middlewares/auth');
const { isSuperAdmin } = require('../middlewares/isAdmin');
const router = Router()


router.get('/get', authenticateUser, isSuperAdmin, getClients);
router.get('/getById/:clientId', authenticateUser, isSuperAdmin, getClientById);

router.post('/create', authenticateUser, isSuperAdmin, createClientPost);
router.put('/:clientId', authenticateUser, isSuperAdmin, updateClientPost);




module.exports = router;




