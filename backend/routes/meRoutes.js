const { Router } = require('express');
const { me } = require('../controllers/meController');
const router = Router()



router.get("/",me)


module.exports = router;

