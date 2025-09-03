const { Router } = require('express');
const { me } = require('../controllers/meController');
const { authenticateUser } = require('../middlewares/auth');
const router = Router()



router.get("/", me)


module.exports = router;

