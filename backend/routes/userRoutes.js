const { Router } = require('express');
const { loginPost, registerPost, logout, forgotPasswordPost, resetPasswordPost, getUsersByClientId } = require('../controllers/userController');
const { authenticateUser } = require('../middlewares/auth');
const { createUser } = require('../services/userService');
const router = Router()

router.get('/by-client/:clientId', authenticateUser, getUsersByClientId); // interface : req.params.clientId
router.post('/login', loginPost); // interface : { emailOrUsername, password } = req.body; 
router.post('/register', authenticateUser, registerPost); // TODO: à refaire
router.post('/logout', logout) // interface : req.cookies.token

router.post('/forgot-password', forgotPasswordPost);    // interface : { email } = req.body;
router.post('/reset-password', resetPasswordPost); // interface : { token, newPassword } = req.body;

router.post('/create', createUser); // interface : { username, firstname, lastname, email, clientid } = req.body;

module.exports = router;

