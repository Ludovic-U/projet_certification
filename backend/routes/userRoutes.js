const { Router } = require('express');
const { loginPost, registerPost, logout, forgotPasswordPost, resetPasswordPost } = require('../controllers/userController');
const { authenticateUser } = require('../middlewares/auth');
const router = Router()


router.post('/login', loginPost); // interface : { emailOrUsername, password } = req.body; 
router.post('/:clientId/register', authenticateUser,registerPost); // TODO:
router.post('/logout', logout) // interface : req.cookies.token

router.post('/forgot-password', forgotPasswordPost);    // interface : { email } = req.body;
router.post('/reset-password', resetPasswordPost); // interface : { token, newPassword } = req.body; 



module.exports = router;
