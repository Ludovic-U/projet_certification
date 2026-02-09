const responseService = require("../services/responseService");

/**
 * Create a new response.
 *
 * @async
 * @function createResponse
 * @param {Object} req.body - Request payload.
 * @param {String} req.body.label - The text of the response (required).
 * @param {String} [req.body.keyword] - The keyword for the response.
 * @param {number} req.body.projectId - The ID of the associated project (required).
 * @param {number} req.body.questionId - The ID of the associated question (required).
 * @param {number|null} [req.body.optionId=null] - The ID of the assiocated option.
 * @param {number"null} [req.body.responseIdParent=null] - The ID of the parent response if this is a sub-response.
 * @returns {promise<void>} Sends:
 *  - 201: Created, returns the created response object.
 *  - 400: Missing required field ('label').
 *  - 500: Internal server error.
 */
module.exports.createResponse = async (req, res) => {
  let idParent;
  const { label, keyword, projectId, questionId, optionId, responseIdParent } = req.body;

  // Check label to not be null or empty
  if (!label) {
    return res.status(400).json({ error: "label is required" });
  }

  // Check if a responseIdParent has been recieved
  if (responseIdParent) {
    idParent = Number(responseIdParent);
  }

  try {
    const response = await responseService.createResponse({
      label,
      keyword,
      projectId,
      questionId,
      optionId: optionId ?? null,
      responseIdParent: idParent ?? null,
    });
    res.status(201).json(response);
  } catch (error) {
    if (error.message === "Invalid projectId" || error.message === "Invalid questionId") {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "Project not found" || error.message === "Question not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error creating response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a response by ID.
 *
 * @async
 * @function updateResponse
 * @param {Object} req.params - Request params.
 * @param {string} req.params.responseId - The ID of the response to update.
 * @param {Object} req.body - Request payload with updated fields.
 * @param {string} [req.body.label] - The updated response text.
 * @param {number} req.body.projectId - The ID of the associated project.
 * @param {number} req.body.questionId - The ID of the associated question.
 * @param {number} req.body.optionId -The ID of the associated option.
 * @param {number} req.body.responseIdParent - Parent response ID if it's a sub-response.
 * @returns {Promise<void} Sends:
 * - 200: OK, returns the updated response.
 * - 400: Missing required field ('label').
 * - 404: Response not found.
 * - 500: Internal server error.
 */
module.exports.updateResponse = async (req, res) => {
  const { responseId } = req.params;

  const { label, projectId, questionId, optionId, responseIdParent } = req.body;

  // Check label to not be empty
  if (label === "") {
    return res.status(400).json({ error: "label is required" });
  }

  try {
    const response = await responseService.updateResponse(responseId, {
      label,
      projectId,
      questionId,
      optionId,
      responseIdParent,
    });
    res.status(200).json(response);
  } catch (error) {
    if (error.message === "Response not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error updating response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a response by ID.
 *
 * @async
 * @function deleteResponse
 * @param {Object} req.params - Request params.
 * @param {string} req.params.responseId - The ID of the response to delete.
 * @returns {Promise<void>} Sends:
 * - 204: No Content, response deleted successfully.
 * - 404: Response not found.
 * - 500: Internal server error.
 */
module.exports.deleteResponse = async (req, res) => {
  const { responseId } = req.params;

  try {
    await responseService.deleteResponse(responseId);
    res.status(204).send();
  } catch (error) {
    if (error.message === "Response not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error deleting response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get responses by question ID of project ID.
 *
 * @async
 * @function getResponsesByQuestionOfProject
 * @param {Object} req.params - Request params.
 * @param {string} req.params.projectId - The project ID to filter responses by.
 * @param {string} req.params.questionID - The question ID to filter responses by.
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns an array of responses for the given question of a project.
 * - 404: Project or question not found.
 * - 500: Internal server error.
 */
module.exports.getResponsesByQuestionOfProject = async (req, res) => {
  const { projectId, questionId } = req.params;

  try {
    const responses = await responseService.getResponsesByQuestionOfProject(
      projectId,
      questionId
    );
    return res.status(200).json(responses);
  } catch (error) {
    if (error.message === "Project not found") {
      return res.status(404).json({ error: error.message });
    } else if (error.message === "Question not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error fetching response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get responses by project ID.
 *
 * @async
 * @function getResponsesByProject
 * @param {Object} req.params - Request params.
 * @param {string} req.params.projectId - The project ID to filter responses by.
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns an array of responses for the given project.
 * - 404: Project not found.
 * - 500: Internal server error.
 */
module.exports.getResponsesByProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const responses = await responseService.getResponsesByProject(projectId);
    res.status(200).json(responses);
  } catch (error) {
    if (error.message === "Project not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error fetching response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get subresponses by parent response ID.
 *
 * @async
 * @function getSubResponses
 * @param {Object} req.params - Request params.
 * @param {string} req.params.responseId - The parent response ID to fetch subresponses for.
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns an array of subresponses.
 * - 404: Parent response not found.
 * - 500: Internal server error.
 */
module.exports.getSubResponses = async (req, res) => {
  const { responseId } = req.params;

  try {
    const subResponses = await responseService.getSubResponses(
      parseInt(responseId)
    );
    res.status(200).json(subResponses);
  } catch (error) {
    if (error.message === "ResponseParent not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error fetching sub-responses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
