const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");
const { authenticateUser } = require("../middlewares/auth");
const { isSuperAdmin } = require("../middlewares/isAdmin");

// All config routes require super_admin
// GET /api/config - Lire la configuration
router.get("/", authenticateUser, isSuperAdmin, configController.getConfig);

// PUT /api/config - Mettre à jour la configuration (admin seulement)
router.put("/", authenticateUser, isSuperAdmin, configController.updateConfig);

// GET /api/config/prompts - Lire seulement les prompts
router.get("/prompts", authenticateUser, isSuperAdmin, configController.getPrompts);

// PUT /api/config/prompts - Mettre à jour seulement les prompts
router.put("/prompts", authenticateUser, isSuperAdmin, configController.updatePrompts);

// POST /api/config/help-dictionary - Mettre à jour le dictionnaire d'aide
router.post("/help-dictionary", authenticateUser, isSuperAdmin, configController.updateHelpDictionary);

module.exports = router;
