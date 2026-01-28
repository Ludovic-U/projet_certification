import * as mistralService from "../services/mistralService.js";
import fs from 'fs';

export const testMistral = async (req, res) => {
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
    
    const response = await mistralService.testMistralAPI(combinedText);

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