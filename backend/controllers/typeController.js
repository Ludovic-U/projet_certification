const typeService = require("../services/typeService");

/**
 * Create a new type.
 *
 * @async
 * @function createType
 * @param {Object} req.body - Request payload.
 * @param {string} req.body.label - The name of the type (required).
 * @param {Array} [req.body.questions=[]] - A list of question identifiers associated with the type.
 * @param {Array} [req.body.projects=[]] - A list of project identifiers associated with the type.
 * @returns {Promise<void>} Sends:
 *  - 201: Created, returns the created type object.
 *  - 400: Missing required fields ('label').
 *  - 500: Internal server error.
 */
module.exports.createType = async (req, res) => {
  const { label, questions, projects } = req.body;

  // Check label to not be null or empty
  if (!label) {
    return res.status(400).json({ error: "label is required" });
  }

  try {
    const type = await typeService.createType({
      label,
      questions: questions ?? [],
      projects: projects ?? [],
    });
    res.status(201).json(type);
  } catch (error) {
    console.error("Error creating type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all types.
 *
 * @async
 * @function getAllTypes
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns an array of types.
 * - 500: Internal server error.
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
 *
 * @async
 * @function updateType
 * @param {Object} req.params - Request params.
 * @param {string} req.params.typeId - The ID of the type to update.
 * @param {object} req.body - Request payload with updated fields.
 * @param {string} req.body.label - The updated type name.
 * @param {Array} [req.body.addQuestion] - Questions to add.
 * @param {Array} [req.body.removeQuestion] - Questions to remove.
 * @param {Array} [req.body.addProject] - Projects to add.
 * @param {Array} [req.body.removeProject] - Projects to remove.
 * @returns {Promise<void>} Sends:
 *  - 200: OK, returns the updated type.
 *  - 404: Type not found.
 *  - 500: Internal server error.
 */
module.exports.updateType = async (req, res) => {
  const { typeId } = req.params;

  const { label, addQuestion, removeQuestion, addProject, removeProject } =
    req.body;

  // Check label to not be empty
  if (label === "") {
    return res.status(400).json({ error: "label is required" });
  }

  try {
    const type = await typeService.updateType(typeId, {
      label,
      addQuestion,
      removeQuestion,
      addProject,
      removeProject,
    });
    res.status(200).json(type);
  } catch (error) {
    if (error.message === "Type not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error updating type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a type by ID.
 *
 * @async
 * @function deleteType
 * @param {Object} req.params - Request params.
 * @param {string} req.params.typeId - The ID of the type to delete.
 * @returns {Promise<void>} Sends:
 * - 204: No Content, type deleted successfully.
 * - 404: Type not found.
 * - 500: Internal server error.
 */
module.exports.deleteType = async (req, res) => {
  const { typeId } = req.params;

  try {
    await typeService.deleteType(typeId);
    res.status(204).send();
  } catch (error) {
    if (error.message === "Type not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error deleting type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a type by ID.
 *
 * @async
 * @function getTypeById
 * @param {Object} req.params - Request params.
 * @param {string} req.params.typeId - The ID of the type to fetch.
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns the type object.
 * - 404: Type not found.
 * - 500: Internal server error.
 */
module.exports.getTypeById = async (req, res) => {
  const { typeId } = req.params;

  try {
    const type = await typeService.getTypeById(typeId);
    res.status(200).json(type);
  } catch (error) {
    if (error.message === "Type not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error fetching type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
