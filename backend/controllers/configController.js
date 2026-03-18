const fs = require("fs").promises;
const path = require("path");
const { checkPermission } = require("../utils/roles");

const CONFIG_PATH = path.join(__dirname, "../config/app-config.json");

// Lire la configuration
exports.getConfig = async (req, res) => {
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
};

// Mettre à jour la configuration (admin seulement)
exports.updateConfig = async (req, res) => {
  try {
    // Vérifier les permissions
    checkPermission(
      req.user,
      "financeur:manage" // TODO: définir une permission spécifique pour la gestion de la configuration
    );

    const newConfig = req.body;

    // Validation basique de la structure
    if (!newConfig.subtitles || !newConfig.labels || !newConfig.types) {
      return res.status(400).json({
        message: "Structure de configuration invalide. Attendu: { subtitles, labels, types }",
      });
    }

    // Allow prompts to be optional - if not provided, keep existing prompts
    if (!newConfig.prompts) {
      // Don't fail, just warn
      console.warn('No prompts in update, keeping existing ones');
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
};

// Get only prompts
exports.getPrompts = async (req, res) => {
  try {
    const configData = await fs.readFile(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configData);
    res.status(200).json(config.prompts || {});
  } catch (error) {
    console.error('Erreur lors de la lecture des prompts:', error);
    res.status(500).json({
      message: "Erreur lors de la lecture des prompts",
      error: error.message,
    });
  }
};

// Update only prompts
exports.updatePrompts = async (req, res) => {
  try {
    // Vérifier les permissions
    checkPermission(
      req.user,
      "financeur:manage"
    );

    const newPrompts = req.body;

    // Lire la config existante
    const configData = await fs.readFile(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configData);

    // Mettre à jour les prompts
    config.prompts = newPrompts;

    // Écrire la nouvelle configuration
    await fs.writeFile(
      CONFIG_PATH,
      JSON.stringify(config, null, 2),
      'utf8'
    );

    res.status(200).json({
      message: "Prompts mis à jour avec succès",
      prompts: newPrompts,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des prompts:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour des prompts",
      error: error.message,
    });
  }
};

// Update help dictionary
exports.updateHelpDictionary = async (req, res) => {
  try {
    // Vérifier les permissions
    checkPermission(
      req.user,
      "financeur:manage"
    );

    const newHeaders = req.body;

    // Validation basique
    if (!newHeaders || typeof newHeaders !== 'object') {
      return res.status(400).json({
        message: "Dictionnaire d'aide invalide",
      });
    }

    // Mettre à jour les headers dans la config principale
    const configData = await fs.readFile(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configData);
    config.headers = newHeaders;
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');

    res.status(200).json({
      message: "Dictionnaire d'aide mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du dictionnaire d'aide:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du dictionnaire d'aide",
      error: error.message,
    });
  }
};

// Get rate limits
exports.getRateLimits = async (req, res) => {
  try {
    const configData = await fs.readFile(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configData);
    res.status(200).json(config.rateLimits || { ai: { requestsPerHour: 20, enabled: true } });
  } catch (error) {
    console.error('Erreur lors de la lecture des rate limits:', error);
    res.status(500).json({
      message: "Erreur lors de la lecture des rate limits",
      error: error.message,
    });
  }
};

// Update rate limits
exports.updateRateLimits = async (req, res) => {
  try {
    // Vérifier les permissions
    checkPermission(
      req.user,
      "financeur:manage"
    );

    const newRateLimits = req.body;

    // Validation basique
    if (!newRateLimits || typeof newRateLimits !== 'object') {
      return res.status(400).json({
        message: "Rate limits invalide",
      });
    }

    // Lire la config existante
    const configData = await fs.readFile(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configData);

    // Mettre à jour les rate limits
    config.rateLimits = newRateLimits;

    // Écrire la nouvelle configuration
    await fs.writeFile(
      CONFIG_PATH,
      JSON.stringify(config, null, 2),
      'utf8'
    );

    res.status(200).json({
      message: "Rate limits mis à jour avec succès",
      rateLimits: newRateLimits,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des rate limits:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour des rate limits",
      error: error.message,
    });
  }
};
