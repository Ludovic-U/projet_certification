const {
  createIdeationChatbot,
  getIdeationChatbotByProjectId,
  updateIdeationChatbot,
  deleteIdeationChatbot,
  generateIdeationAnswer,
} = require('../services/IdeationMistralService');
const { validateId } = require('../middlewares/validateId');
const { prisma } = require('../prisma/prismaClient');

const MAX_STORED_MESSAGES = 50;
const ALLOWED_ACTION = 'GENERATE_NEW_IDEATION_RESPONSE';

function parseStoredMessages(lastMessages) {
  if (!lastMessages) return [];

  try {
    const parsed = JSON.parse(lastMessages);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((message) => message && typeof message === 'object')
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: typeof message.content === 'string' ? message.content : '',
        timestamp: message.timestamp || new Date().toISOString(),
      }))
      .filter((message) => message.content.trim().length > 0);
  } catch (error) {
    console.warn('Invalid lastMessages JSON, resetting history.');
    return [];
  }
}

function normalizeActions(rawActions) {
  if (!Array.isArray(rawActions)) return [];

  return rawActions
    .filter((action) => action && typeof action === 'object')
    .map((action) => ({
      type: action.type === ALLOWED_ACTION ? ALLOWED_ACTION : null,
      questionId: Number(action.questionId),
      reason: typeof action.reason === 'string' ? action.reason.trim() : '',
    }))
    .filter((action) => action.type === ALLOWED_ACTION && Number.isInteger(action.questionId) && action.questionId > 0)
    .map((action) => ({
      type: action.type,
      questionId: action.questionId,
      reason: action.reason,
    }));
}

function extractAssistantPayload(rawResponse) {
  const fallback = {
    response: 'Je n\'ai pas de reponse pour le moment.',
    actions: [],
  };

  if (!rawResponse) return fallback;

  if (typeof rawResponse === 'object') {
    return {
      response: typeof rawResponse.response === 'string' && rawResponse.response.trim()
        ? rawResponse.response.trim()
        : fallback.response,
      actions: normalizeActions(rawResponse.actions),
    };
  }

  if (typeof rawResponse === 'string') {
    try {
      const parsed = JSON.parse(rawResponse);
      return {
        response: typeof parsed?.response === 'string' && parsed.response.trim()
          ? parsed.response.trim()
          : rawResponse.trim() || fallback.response,
        actions: normalizeActions(parsed?.actions),
      };
    } catch (_error) {
      return {
        response: rawResponse.trim() || fallback.response,
        actions: [],
      };
    }
  }

  return fallback;
}

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

module.exports.chatWithIdeationMistralPost = async (req, res) => {
  const projectId = Number(req.params.projectId);
  if (!validateId(projectId, 'projectId', res)) return;

  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    let chatbot;
    try {
      chatbot = await getIdeationChatbotByProjectId(projectId);
    } catch (error) {
      if (error.message !== 'Chatbot not found') throw error;

      chatbot = await createIdeationChatbot({
        projectId,
        lastMessages: JSON.stringify([]),
      });
    }

    const history = parseStoredMessages(chatbot.lastMessages);
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    const historyWithUser = [...history, userMessage].slice(-MAX_STORED_MESSAGES);

    const projectLinkedQuestions = await prisma.question.findMany({
      where: {
        projects: {
          some: {
            projectId,
          },
        },
      },
      select: {
        questionId: true,
        label: true,
        keyword: true,
        category: true,
        onglet: true,
      },
      orderBy: {
        questionId: 'asc',
      },
    });

    // Fallback for projects where question links are not populated yet.
    const fallbackQuestions = projectLinkedQuestions.length > 0
      ? []
      : await prisma.question.findMany({
        select: {
          questionId: true,
          label: true,
          keyword: true,
          category: true,
          onglet: true,
        },
        orderBy: {
          questionId: 'asc',
        },
      });

    const availableQuestions = projectLinkedQuestions.length > 0
      ? projectLinkedQuestions
      : fallbackQuestions;

    console.log('[ideation-chatbot] projectId:', projectId);
    console.log('[ideation-chatbot] project-linked questions:', projectLinkedQuestions.length);
    console.log('[ideation-chatbot] fallback questions:', fallbackQuestions.length);
    console.log('[ideation-chatbot] availableQuestions used:', availableQuestions.length);

    const prompt = [
      'Tu es un assistant de projet.',
      'Reponds en francais, de maniere claire et concise.',
      'Retourne STRICTEMENT un objet JSON valide (sans markdown, sans texte autour).',
      'Format JSON attendu:',
      '{"response":"string","actions":[{"type":"GENERATE_NEW_IDEATION_RESPONSE","questionId":123,"answer":"string"}]}',
      `Actions autorisees: ${ALLOWED_ACTION}.`,
      'Regle action: si le message utilisateur demande une information metier qui peut etre obtenue ou mise a jour via une question du projet, tu DOIS remplir actions avec au moins une action.',
      'Regle action: la questionId choisie doit provenir de la liste de questions disponible ci-dessous et etre semantiquement liee a la demande utilisateur. le champs "answer" doit résumer l\'information pertinente fournie par l\'utilisateur.',
      'Exemple: si l\'utilisateur mentionne un projet terminé, ajoute une action liee a la question qui demande s\'il a déjà terminé un projet.',
      'Si aucune action n\'est necessaire, retourne "actions": [].',
      'Chaque action doit referencer une questionId existante dans la liste des questions ci-dessous.',
      `Questions existantes pour ce projet (JSON): ${JSON.stringify(availableQuestions)}`,
      `Historique de conversation (JSON): ${JSON.stringify(historyWithUser)}`,
      `Dernier message utilisateur: ${message}`,
    ].join('\n\n');

    const modelRawResponse = await generateIdeationAnswer(prompt);
    const assistantPayload = extractAssistantPayload(modelRawResponse);
    const assistantText = assistantPayload.response || 'Je n\'ai pas de reponse pour le moment.';

    const assistantMessage = {
      role: 'assistant',
      content: assistantText,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...historyWithUser, assistantMessage].slice(-MAX_STORED_MESSAGES);
    const updatedChatbot = await updateIdeationChatbot(chatbot.chatbotId, {
      lastMessages: JSON.stringify(updatedMessages),
    });

    return res.status(200).json({
      chatbotId: updatedChatbot.chatbotId,
      response: assistantText,
      actions: assistantPayload.actions,
      availableQuestions,
      lastMessages: updatedMessages,
    });
  } catch (error) {
    console.error('Error chatting with ideation mistral:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
