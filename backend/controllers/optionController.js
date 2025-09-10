const optionService = require("../services/optionService");
const { validateId } = require("./helpers/validateId");

/**
 * Create a new option.
 * Expects the following fields in req.body:
 * - label: String
 * - questionId: Number
 */
module.exports.createOption = async (req, res) => {
  const { label, questionId } = req.body;

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
 * Expects optionId in req.params and updated fields in req.body.
 * Responds with the updated option.
 */
module.exports.updateOption = async (req, res) => {
  const optionId = Number(req.params.optionId);
  // Validate optionId
  if (!validateId(optionId, "optionId", res)) return;

  const { label, questionId } = req.body;

  if (!label) {
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
 * Expects optionId in req.params.
 * Responds with the option object.
 */
module.exports.deleteOption = async (req, res) => {
  const optionId = Number(req.params.optionId);
  // Validate optionId
  if (!validateId(optionId, "optionId", res)) return;

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
 * Expects optionId in req.params.
 * Responds with the option object.
 */
module.exports.getOptionById = async (req, res) => {
  const optionId = Number(req.params.optionId);
  // Validate optionId
  if (!validateId(optionId, "optionId", res)) return;

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
 * Get options by question.
 * Expects questionId in req.params.
 * Responds with an array of options.
 */
module.exports.getOptionsByQuestion = async (req, res) => {
  const questionId = Number(req.params.questionId);
  // Validate questionId
  if (!validateId(questionId, "questionId", res)) return;

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
