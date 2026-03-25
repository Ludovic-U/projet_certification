const {
  createIdeationChatbot,
  getIdeationChatbotByProjectId,
  updateIdeationChatbot,
  deleteIdeationChatbot,
  generateIdeationAnswer,
  parseStoredMessages,
  extractIdeationAssistantPayload,
  getAvailableQuestionsForProject,
  applyIdeationActions,
  buildIdeationPrompt,
} = require('../services/IdeationMistralService');
const { validateId } = require('../middlewares/validateId');

const MAX_STORED_MESSAGES = 50;

module.exports.createIdeationChatbotPost = async (req, res) => {
  try {
    const welcomeMessage = {
      role: 'assistant',
      content: 'Bonjour, je suis votre assistant pour vous aider à convevoir votre projet. Avant tout, nous allons explorer la situation existante : Quels sont les secteurs d\'activité des formations que vous dispensez?',
      timestamp: new Date().toISOString(),
    };

    const initialMessages = req.body.lastMessages || JSON.stringify([welcomeMessage]);

    const data = {
      projectId: req.body.projectId,
      chatSummary: req.body.chatSummary,
      lastMessages: initialMessages,
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

  // Block prompt injection attempts
  const injectionPatterns = [
  // System prompt bypass
  /^\/system\s/i,
  /^ignore\s+(all\s+)?(previous\s+)?(instructions?|commands?|rules?)/i,
  /^forget\s+(all\s+)?(previous\s+)?(instructions?|commands?|rules?|context)/i,
  /^you\s+are\s+(now\s+)?(a\s+)?(different|new|another)\s+(ai|assistant|model)/i,
  /^as\s+a\s+(different|new|another)\s+(ai|assistant|model)/i,
  /\b(jailbreak|hack|bypass|override|ignore all)\b/i,
  /\b(dadbot|evilbot|mastermind)\b/i,
  // Non-project topics (multi-language)
  // English
  /\b(tartiflette|recipe|cook|kitchen|ingredients|soup|salad|pizza|pasta|dessert|food|joke|jokes|funny|humor|movie|film|song|music|book|story|weather|sport|news|politics)\b/i,
  // French
  /\b(recette|cuisine|Ingredient|plat|humour|blague|film|musique|meteo|sport|actualite|politique|journal)\b/i,
  // German
  /\b(rezept|Küche|Zutat|Suppe|Salat|Pizza|Nudel|Dessert|Essen|Witz|Spassig|Film|Musik|Wetter|Sport|Nachrichten|Politik)\b/i,
  // Spanish
  /\b(receta|cocina|ingrediente|sopa|ensalada|pizza|pasta|postre|comida|chiste|divertido|humor|pelicula|musica|tiempo|deporte|noticias|politica)\b/i,
  // Italian
  /\b(ricetta|cucina|ingrediente|zuppa|insalata|pizza|pasta|dessert|cibo|barzelletta|divertente|film|musica|meteo|sport|notizie|politica)\b/i,
  // Chinese
  /\b(食谱|厨房|食材|汤|沙拉|披萨|意大利面|甜点|食物|笑话|电影|音乐|天气|运动|新闻|政治)\b/i,
];
  
  for (const pattern of injectionPatterns) {
    if (pattern.test(message)) {
      console.warn('[SECURITY] Prompt injection attempt blocked:', message.substring(0, 100));
      return res.status(400).json({ 
        error: 'Invalid input. This chatbot is only for project ideation questions.' 
      });
    }
  }

  // Limit message length
  if (message.length > 500) {
    return res.status(400).json({ error: 'Message too long (max 500 characters)' });
  }

  try {
    // 1) Recuperer (ou creer) l'instance chatbot du projet.
    let chatbot;
    try {
      chatbot = await getIdeationChatbotByProjectId(projectId);
    } catch (error) {
      if (error.message !== 'Chatbot not found') throw error;

      const welcomeMessage = {
        role: 'assistant',
        content: 'Bonjour, je suis votre assistant pour vous aider à convevoir votre projet. Avant tout, nous allons explorer la situation existante : Quels sont les secteurs d\'activité des formations que vous dispensez?',
        timestamp: new Date().toISOString(),
      };

      chatbot = await createIdeationChatbot({
        projectId,
        lastMessages: JSON.stringify([welcomeMessage]),
      });
    }

    // 2) Reconstruire l'historique utile et injecter le dernier message utilisateur.
    const history = parseStoredMessages(chatbot.lastMessages);
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    const historyWithUser = [...history, userMessage].slice(-MAX_STORED_MESSAGES);

    // 3) Charger les questions disponibles pour le projet.
    const {
      projectLinkedQuestions,
      fallbackQuestions,
      availableQuestions,
    } = await getAvailableQuestionsForProject(projectId);

    console.log('[ideation-chatbot] projectId:', projectId);
    console.log('[ideation-chatbot] project-linked questions:', projectLinkedQuestions.length);
    console.log('[ideation-chatbot] fallback questions:', fallbackQuestions.length);
    console.log('[ideation-chatbot] availableQuestions used:', availableQuestions.length);

    // 4) Construire le prompt, appeler le modele puis normaliser le payload.
    const prompt = await buildIdeationPrompt({
      message,
      historyWithUser,
      availableQuestions,
      projectId,
    });

    const modelRawResponse = await generateIdeationAnswer(prompt);
    const assistantPayload = extractIdeationAssistantPayload(modelRawResponse);
    const assistantText = assistantPayload.response || 'Je n\'ai pas de reponse pour le moment.';

    // 5) Persister l'historique conversationnel mis a jour.
    const assistantMessage = {
      role: 'assistant',
      content: assistantText,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...historyWithUser, assistantMessage].slice(-MAX_STORED_MESSAGES);
    const updatedChatbot = await updateIdeationChatbot(chatbot.chatbotId, {
      lastMessages: JSON.stringify(updatedMessages),
    });

    // 6) Appliquer les actions metier proposees par l'IA (creation de reponses).
    const actionExecution = await applyIdeationActions(
      assistantPayload.actions,
      projectId,
      availableQuestions,
    );

    // 7) Retourner la reponse complete au frontend.
    return res.status(200).json({
      chatbotId: updatedChatbot.chatbotId,
      response: assistantText,
      actions: assistantPayload.actions,
      actionExecution,
      availableQuestions,
      lastMessages: updatedMessages,
    });
  } catch (error) {
    console.error('Error chatting with ideation mistral:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
