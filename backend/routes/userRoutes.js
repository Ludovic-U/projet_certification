const { Router } = require('express');
const { loginPost, registerPost, logout } = require('../controllers/userController');
const { authenticateUser } = require('../middlewares/auth');
const router = Router()













router.post('/login',loginPost);
router.post('/:clientId/register',authenticateUser,registerPost);
router.get('/logout',authenticateUser,logout)



module.exports = router;