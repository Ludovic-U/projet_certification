const mistralService = require("../services/mistralService");
const fs = require('fs');

const sanitizeInput = (input) => {
  return input 
    .slice(0,500)
    .replace(/[\x00-\1F\x7F]/g, '')
    .trim();
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