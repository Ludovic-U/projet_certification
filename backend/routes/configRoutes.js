const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");

// GET /api/config - Lire la configuration
router.get("/", configController.getConfig);

// PUT /api/config - Mettre à jour la configuration (admin seulement)
router.put("/", configController.updateConfig);

// GET /api/config/prompts - Lire seulement les prompts
router.get("/prompts", configController.getPrompts);

// PUT /api/config/prompts - Mettre à jour seulement les prompts
router.put("/prompts", configController.updatePrompts);

module.exports = router;
