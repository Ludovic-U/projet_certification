const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const { checkPermission } = require("../utils/roles");

const CONFIG_PATH = path.join(__dirname, "../config/app-config.json");

// GET /api/config - Lire la configuration
router.get("/", async (req, res) => {
  try {
    const configData = await fs.readFile(CONFIG_PATH, "utf8");
    const config = JSON.parse(configData);
    res.status(200).json(config);
  } catch (error) {
    console.error("Erreur lors de la lecture de la configuration:", error);
    res.status(500).json({
      message: "Erreur lors de la lecture de la configuration",
      error: error.message,
    });
  }
});

// PUT /api/config - Mettre à jour la configuration (admin seulement)
router.put("/", async (req, res) => {
  try {
    // Vérifier les permissions
    checkPermission(
      req.user,
      "financeur:manage" // TODO: définir une permission spécifique pour la gestion de la configuration
    );    

    const newConfig = req.body;

    // Validation basique de la structure
    if (!newConfig.subtitles || !newConfig.labels) {
      return res.status(400).json({
        message: "Structure de configuration invalide. Attendu: { subtitles, labels }",
      });
    }

    // Écrire la nouvelle configuration
    await fs.writeFile(
      CONFIG_PATH,
      JSON.stringify(newConfig, null, 2),
      "utf8"
    );

    res.status(200).json({
      message: "Configuration mise à jour avec succès",
      config: newConfig,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la configuration:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la configuration",
      error: error.message,
    });
  }
});

module.exports = router;
