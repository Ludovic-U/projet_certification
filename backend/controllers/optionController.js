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
