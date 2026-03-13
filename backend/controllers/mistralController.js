const mistralService = require("../services/mistralService");
const fs = require('fs');

// Prompt injection detection patterns - expanded
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

function isPromptInjection(input) {
  if (!input || typeof input !== 'string') return false;
  const lowerInput = input.toLowerCase();
  for (const pattern of injectionPatterns) {
    if (pattern.test(lowerInput)) return true;
  }
  return false;
}

// Use the service's sanitization function for better security
const sanitizeUsrInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return mistralService.sanitizeUserInput(input);
}

const aiRateLimiter = (req, res, next) => {
  const userId = req.user.userId;
  const now = Date.now();
  const key = `ai:${userId}`;

  if (!aiRateStore.has(key)) {
    aiRateStore.set(key, { count: 1, resetTime: now + 3600000 });
    } else {
      const data= aiRateStore.get(key);
      if (data.count > 20) {
        return res.status(429).json({ error: 'Requête IA limité à 20 par heure'});
      }
      data.count++;
    }
    next();
  };

exports.testMistral = async (req, res) => {
  try {
    // Vérifier la présence d'un fichier ou de texte
    const text = req.body.text || "";
    const hasFile = req.file;
    const hasText = text && text.trim().length > 0;

    if (!hasFile && !hasText) {
      return res.status(400).json({ error: "No file or text uploaded" });
    }

    // Block prompt injection
    if (hasText && isPromptInjection(text)) {
      console.warn('[SECURITY] Prompt injection attempt blocked:', text.substring(0, 100));
      return res.status(400).json({ 
        error: 'Invalid input. This AI is only for generating Gantt charts.' 
      });
    }

    // Lire le contenu du fichier
    let fileText = "";
    if (hasFile) {
      fileText = await mistralService.MistralOCR(req.file.path);      
    }

    // Combiner le texte du fichier et le texte entré
    const combinedText = [fileText, text].filter(t => t && t.trim().length > 0).join("\n");
    
    const response = await mistralService.GenerateGanttMistralAPI(combinedText);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in testMistral controller:", error);
    
    // Nettoyer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: "Internal server error", details: error.message });
  } 
};

exports.generateMindmapFromResponses = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const numericProjectId = parseInt(projectId, 10);
    if (isNaN(numericProjectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const response = await mistralService.GenerateMindmapFromResponses(numericProjectId);
    
    // If there's an error property in the response, return 404
    if (response && response.error) {
      return res.status(404).json(response);
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error("Error generating mindmap from responses:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};