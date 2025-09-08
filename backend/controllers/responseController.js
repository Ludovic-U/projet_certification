const responseService = require("../services/responseService");

/**
 * Create a new response.
 * Expects the following fields in req.body:
 * - label: String (Optional)
 * - projectId: Number
 * - questionId: Number
 * - optionId: Number (Optional)
 * - responseIdParent: Number (Optional)
 */
module.exports.createResponse = async (req, res) => {
  const { label, projectId, questionId, optionId, responseIdParent } = req.body;

  try {
    const response = await responseService.createResponse({
      label: label ?? null,
      projectId,
      questionId,
      optionId: optionId ?? null,
      responseIdParent: responseIdParent ?? null,
    });
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a response by ID.
 * Expects responseId in req.params and updated fields in req.body.
 * Responds with the updated response.
 */
module.exports.updateResponse = async (req, res) => {
  const responseId = Number(req.params.responseId);
  // Validate reponseId
  if (!Number.isInteger(responseId) || responseId <= 0) {
    return res.status(400).json({ error: "Invalid responseId" });
  }

  const { label, projectId, questionId, optionId, responseIdParent } = req.body;

  try {
    const response = await responseService.updateResponse(responseId, {
      label: label ?? null,
      projectId,
      questionId,
      optionId: optionId ?? null,
      responseIdParent: responseIdParent ?? null,
    });
    res.status(200).json(response);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Response not found" });
    }
    console.error("Error updating response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a response by ID.
 * Expects responseId in req.params.
 * Responds with 204 No Content on success.
 */
module.exports.deleteResponse = async (req, res) => {
  const responseId = Number(req.params.responseId);
  // Validate responseId
  if (!Number.isInteger(responseId) || responseId <= 0) {
    return res.status(400).json({ error: "Invalid responseId" });
  }

  try {
    await responseService.deleteResponse(responseId);
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Response not found" });
    }
    console.error("Error deleting response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get responses by question of a project.
 * Expects projectId and questionId in req.params.
 * Responds with an array of responses for the given project and question.
 */
module.exports.getResponsesByQuestionOfProject = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const questionId = Number(req.params.questionId);
  // Validate projectId and questionId
  if (
    !Number.isInteger(projectId) ||
    !Number.isInteger(questionId) ||
    projectId <= 0 ||
    questionId <= 0
  ) {
    return res.status(400).json({ error: "Invalid projectId or questionId" });
  }

  try {
    const responses = await responseService.getResponsesByQuestionOfProject(
      projectId,
      questionId
    );
    return res.status(200).json(responses);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Project or Question not found" });
    }
    console.error("Error fetching response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get responses by project.
 * Expects projectId in req.params.
 * Responds with an array of responses for the given project.
 */
module.exports.getResponsesByProject = async (req, res) => {
  const projectId = Number(req.params.projectId);
  // Validate projectId
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: "Invalid projectId" });
  }

  try {
    const responses = await responseService.getResponsesByProject(projectId);
    res.status(200).json(responses);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Project not found" });
    }
    console.error("Error fetching response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get subReponses by parent response ID.
 * Expects responseIdParent in req.params.
 * Responds with an array of subresponses.
 */
module.exports.getSubResponses = async (req, res) => {
  const responseIdParent = Number(req.params.responseIdParent);
  // Validate reponseIdParent
  if (!Number.isInteger(responseIdParent) || responseIdParent <= 0) {
    return res.status(400).json({ error: "Invalid responseIdParent" });
  }

  try {
    const subResponses = await responseService.getSubResponses(
      parseInt(responseIdParent)
    );
    res.status(200).json(subResponses);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "ResponseParent not found" });
    }
    console.error("Error fetching sub-responses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
