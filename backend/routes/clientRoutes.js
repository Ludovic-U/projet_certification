const { Router } = require('express')
const { createClientPost, getClients, getClientById } = require('../controllers/clientController');
const { authenticateUser } = require('../middlewares/auth');
const router = Router()


router.get('/get', authenticateUser, getClients);
router.get('/getById/:clientId', authenticateUser, getClientById);

router.post('/create', authenticateUser, createClientPost);




module.exports = router;




