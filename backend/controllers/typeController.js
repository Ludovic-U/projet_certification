const typeService = require("../services/typeService");

/**
 * Create a new type.
 * Expects the following fields in req.body:
 * - label: String
 */
module.exports.createType = async (req, res) => {
  const { label } = req.body;

  try {
    const type = await typeService.createType({
      label: label,
    });
    res.status(201).json(type);
  } catch (error) {
    console.error("Error creating type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all types.
 * Responds with an array of all types.
 */
module.exports.getAllTypes = async (_, res) => {
  try {
    const types = await typeService.getAllTypes();
    res.status(200).json(types);
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a type by ID.
 * Expects typeId in req.params and updated fields in req.body.
 * Responds with the updated type.
 */
module.exports.updateType = async (req, res) => {
  const { typeId } = req.params;
  // Check if typeId is a number
  if (isNaN(typeId)) {
    return res.status(400).json({ error: "Bad request: Invalid typeId" });
  }
  const { label } = req.body;

  try {
    const type = await typeService.updateType(typeId, { label: label });
    res.status(200).json(type);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: "Type not found" });
    }
    console.error("Error updating type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a type by ID.
 * Expects typeId in req.params.
 * Responds with 204 No content on success.
 */
module.exports.deleteType = async (req, res) => {
  const { typeId } = req.params;
  // Check if typeId is a number
  if (isNaN(typeId)) {
    return res.status(400).json({ error: "Bad request: Invalid typeId" });
  }

  try {
    await typeService.deleteType(typeId);
    res.status(204).send();
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: "Type not found" });
    }
    console.error("Error deleting type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a type by ID.
 * Expects typeId in req.params.
 * Responds with the type object.
 */
module.exports.getTypeById = async (req, res) => {
  const { typeId } = req.params;
  // Check if typeId is a number
  if (isNaN(typeId)) {
    return res.status(400).json({ error: "Bad request: Invalid typeId" });
  }

  try {
    const type = await typeService.getTypeById(typeId);
    res.status(200).json(type);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: "Type not found" });
    }
    console.error("Error fetching type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
