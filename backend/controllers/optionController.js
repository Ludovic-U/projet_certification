const optionService = require("../services/optionService");

/**
 * Create a new option.
 *
 * @async
 * @function createOption
 * @param {Object} req.body - Request payload.
 * @param {String} req.body.label - The text of the option (required).
 * @param {number} req.body.questionId - The ID of the associated question (required).
 * @returns {promise<void>} Sends:
 *  - 201: Created, returns the created option object.
 *  - 400: Missing required field ('label').
 *  - 500: Internal server error.
 */
module.exports.createOption = async (req, res) => {
  const { label, questionId } = req.body;

  // Check label to not be null or empty
  if (!label) {
    return res.status(400).json({ error: "label is required" });
  }

  try {
    const option = await optionService.createOption({ label, questionId });
    res.status(201).json(option);
  } catch (error) {
    console.error("Error creating option:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update an option by ID.
 *
 * @async
 * @function updateOption
 * @param {Object} req.params - Request params.
 * @param {string} req.params.optionId - The ID of the option to update.
 * @param {Object} req.body - Request payload.
 * @param {String} req.body.label - The text of the option.
 * @param {number} req.body.questionId - The ID of the associated question.
 * @returns {promise<void>} Sends:
 *  - 200: OK, returns the updated option.
 *  - 400: Missing required field ('label').
 *  - 404: Option not found.
 *  - 500: Internal server error.
 */
module.exports.updateOption = async (req, res) => {
  const { optionId } = req.params;

  const { label, questionId } = req.body;

  // Check label to not be empty
  if (label === "") {
    return res.status(400).json({ error: "label is required" });
  }

  try {
    const option = await optionService.updateOption(optionId, {
      label,
      questionId,
    });
    res.status(200).json(option);
  } catch (error) {
    if (error.message === "Option not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error updating option:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete an option by ID.
 *
 * @async
 * @function deleteOption
 * @param {Object} req.params - Request params.
 * @param {string} req.params.optionId - The ID of the option to delete.
 * @returns {Promise<void>} Sends:
 * - 204: No Content, option deleted successfully.
 * - 404: Option not found.
 * - 500: Internal server error.
 */
module.exports.deleteOption = async (req, res) => {
  const { optionId } = req.params;

  try {
    await optionService.deleteOption(optionId);
    res.status(204).send();
  } catch (error) {
    if (error.message === "Option not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error deleting option:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get an option by ID.
 *
 * @async
 * @function getOptionById
 * @param {Object} req.params - Request params.
 * @param {string} req.params.optionId - The ID of the option to fetch.
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns the option object.
 * - 404: Option not found.
 * - 500: Internal server error.
 */
module.exports.getOptionById = async (req, res) => {
  const { optionId } = req.params;

  try {
    const option = await optionService.getOptionById(optionId);
    res.status(200).json(option);
  } catch (error) {
    if (error.message === "Option not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error fetching option:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get options by question ID.
 *
 * @async
 * @function getOptionsByQuestion
 * @param {Object} req.params - Request params.
 * @param {string} req.params.questionId - The question ID to filter options by.
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns an array of options for the given question.
 * - 404: Question not found.
 * - 500: Internal server error.
 */
module.exports.getOptionsByQuestion = async (req, res) => {
  const { questionId } = req.params;

  try {
    const options = await optionService.getOptionsByQuestion(questionId);
    res.status(200).json(options);
  } catch (error) {
    if (error.message === "Question not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error fetching options:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
