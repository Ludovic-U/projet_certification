const { Router } = require('express')
const { getProjectsByClientId, createProjectPost } = require('../controllers/projectController');
const { authenticateUser } = require('../middlewares/auth');
const router = Router()

router.get('/getByClientId/:clientId', authenticateUser, getProjectsByClientId);
router.post('/create', authenticateUser, createProjectPost);

module.exports = router;