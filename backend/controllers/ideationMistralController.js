const {
  createIdeationChatbot,
  getIdeationChatbotByProjectId,
  updateIdeationChatbot,
  deleteIdeationChatbot,
} = require('../services/IdeationMistralService');
const { validateId } = require('../middlewares/validateId');

module.exports.createIdeationChatbotPost = async (req, res) => {
  try {
    const data = {
      projectId: req.body.projectId,
      chatSummary: req.body.chatSummary,
      lastMessages: req.body.lastMessages,
      remainingQuestionIds: req.body.remainingQuestionIds,
    };

    const chatbot = await createIdeationChatbot(data);
    return res.status(201).json(chatbot);
  } catch (error) {
    console.error('Error creating ideation chatbot:', error);

    if (error.message === 'Invalid projectId') {
      return res.status(400).json({ error: error.message });
    }

    if (error.message === 'Chatbot already exists for this project') {
      return res.status(409).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.getIdeationChatbotByProjectIdGet = async (req, res) => {
  const projectId = Number(req.params.projectId);
  if (!validateId(projectId, 'projectId', res)) return;

  try {
    const chatbot = await getIdeationChatbotByProjectId(projectId);
    return res.status(200).json(chatbot);
  } catch (error) {
    console.error('Error fetching ideation chatbot by project id:', error);

    if (error.message === 'Chatbot not found') {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.updateIdeationChatbotPut = async (req, res) => {
  const chatbotId = Number(req.params.chatbotId);
  if (!validateId(chatbotId, 'chatbotId', res)) return;

  try {
    const data = {
      chatSummary: req.body.chatSummary,
      lastMessages: req.body.lastMessages,
      remainingQuestionIds: req.body.remainingQuestionIds,
    };

    const updatedChatbot = await updateIdeationChatbot(chatbotId, data);
    return res.status(200).json(updatedChatbot);
  } catch (error) {
    console.error('Error updating ideation chatbot:', error);

    if (error.message === 'Chatbot not found') {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.deleteIdeationChatbotDelete = async (req, res) => {
  const chatbotId = Number(req.params.chatbotId);
  if (!validateId(chatbotId, 'chatbotId', res)) return;

  try {
    await deleteIdeationChatbot(chatbotId);
    return res.status(200).json({ message: 'Chatbot deleted successfully' });
  } catch (error) {
    console.error('Error deleting ideation chatbot:', error);

    if (error.message === 'Chatbot not found') {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};
