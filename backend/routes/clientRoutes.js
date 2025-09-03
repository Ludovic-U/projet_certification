const { Router } = require('express')
const { createClient, getClients } = require('../controllers/clientController');
const router = Router()


router.post('/create', createClient);

router.get('/get', getClients);


module.exports = router;




