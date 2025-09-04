const optionService = require("../services/optionService");

/**
 * Create a new option.
 * Expects the following fields in req.body:
 * - label: String
 * - questionId: Number
 */
module.exports.createOption = async (req, res) => {
  const { label, questionId } = req.body;

  try {
    const option = await optionService.createOption({
      label: label,
      questionId: questionId,
    });
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
  const { optionId } = req.params;
  // check if optionId is a number
  if (isNaN(optionId)) {
    return res.status(400).json({ error: "Bad request: Invalid optionId" });
  }

  const { label, questionId } = req.body;

  try {
    const option = await optionService.updateOption(optionId, {
      label: label,
      questionId: questionId,
    });
    res.status(200).json(option);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: "Option not found" });
    }
    console.error("Error updating option:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
