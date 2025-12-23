const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");

// GET /api/config - Lire la configuration
router.get("/", configController.getConfig);

// PUT /api/config - Mettre à jour la configuration (admin seulement)
router.put("/", configController.updateConfig);

module.exports = router;
