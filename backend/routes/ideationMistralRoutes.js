const { Router } = require('express');
const {
  createIdeationChatbotPost,
  getIdeationChatbotByIdGet,
  getIdeationChatbotByProjectIdGet,
  updateIdeationChatbotPut,
  deleteIdeationChatbotDelete,
  chatWithIdeationMistralPost,
} = require('../controllers/ideationMistralController');
const { authenticateUser } = require('../middlewares/auth');

const router = Router();

router.post('/create', authenticateUser, createIdeationChatbotPost);
router.get('/project/:projectId', authenticateUser, getIdeationChatbotByProjectIdGet);
router.post('/project/:projectId/chat', authenticateUser, chatWithIdeationMistralPost);
router.put('/:chatbotId', authenticateUser, updateIdeationChatbotPut);
router.delete('/:chatbotId', authenticateUser, deleteIdeationChatbotDelete);

module.exports = router;
