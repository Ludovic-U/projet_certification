const questionService = require("../services/questionService");

/**
 * Create a new question.
 *
 * @async
 * @function createQuestion
 * @param {Object} req.body - Request payload.
 * @param {string} req.body.label - The text of the question (required).
 * @param {string} req.body.category - The category this question belongs to (required).
 * @param {number} [req.body.numberOfSelectionableOpt=null] - Maximum number of selectable options.
 * @param {boolean} [req.body.isRelevant=false] - Whether the question is considered relevant.
 * @param {boolean} [req.body.hasMultipleOpenResponse=false] - Whether the question allows multiple open responses.
 * @param {boolean} [req.body.shouldMultiply=false] - Indicates if the question should be multiplied.
 * @param {number|null} [req.body.questionIdParent=null] - The ID of the parent question if this is a sub-question.
 * @param {Array} [req.body.types=[]] - A list of type identifiers associated with the question.
 * @param {Array} [req.body.projects=[]] - A list of project identifiers associated with the question.
 * @param {Array} [req.body.options=[]] - A list of option identifiers associated with the question.
 * @returns {Promise<void>} Sends:
 * - 201: Created, returns the created question object.
 * - 400: Missing required field (`label` or `category`).
 * - 500: Internal server error.
 */
module.exports.createQuestion = async (req, res) => {
  console.log("create question Request body:", req.body);
  let idParent = null;
  const {
    label,
    category,
    numberOfSelectionableOpt,
    isRelevant,
    hasMultipleOpenResponse,
    shouldMultiply,
    questionIdParent,
    types,
    projects,
    options,
  } = req.body;

  // Check label or category to be not null or empty
  if (!label || !category) {
    res.status(400).json({ error: "label and category are required" });
  }

  // Check if a responseIdParent has been recieved
  if (questionIdParent) {
    idParent = Number(questionIdParent);
  }

  try {
    const question = await questionService.createQuestion({
      label,
      category,
      numberOfSelectionableOpt: numberOfSelectionableOpt ?? null,
      isRelevant: isRelevant ?? false,
      hasMultipleOpenResponse: hasMultipleOpenResponse ?? false,
      shouldMultiply: shouldMultiply ?? false,
      questionIdParent: idParent ?? null,
      types: types ?? [],
      projects: projects ?? [],
      options: options ?? [],
    });
    res.status(201).json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all questions with paginations.
 *
 * @async
 * @function getAllQuestions
 * @param {Object} req.query - Query parameters.
 * @param {number} [req.query.page=1] - Page number for pagination.
 * @param {number} [req.query.limit=10] - Number of questions per page.
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns an array of questions for the requested page.
 * - 500: Internal server error.
 */
module.exports.getAllQuestions = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const questions = await questionService.getAllQuestions(page, limit);
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a question by ID.
 *
 * @async
 * @function updateQuestion
 * @param {Object} req.params - Request params.
 * @param {string} req.params.questionId - The ID of the question to update.
 * @param {Object} req.body - Request payload with updated fields.
 * @param {string} req.body.label - The updated question text.
 * @param {string} req.body.category - The updated question category.
 * @param {number} [req.body.numberOfSelectionableOpt] - Maximum number of selectable options.
 * @param {boolean} [req.body.isRelevant] - Whether the question is relevant.
 * @param {boolean} [req.body.hasMultipleOpenResponse] - Whether multiple open responses are allowed.
 * @param {boolean} [req.body.shouldMultiply] - Whether the question should be multiplied.
 * @param {number|null} [req.body.questionIdParent] - Parent question ID if it's a sub-question.
 * @param {Array} [req.body.addType] - Types to add.
 * @param {Array} [req.body.removeType] - Types to remove.
 * @param {Array} [req.body.addProject] - Projects to add.
 * @param {Array} [req.body.removeProject] - Projects to remove.
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns the updated question.
 * - 404: Question not found.
 * - 500: Internal server error.
 */
module.exports.updateQuestion = async (req, res) => {
  const { questionId } = req.params;

  const {
    label,
    category,
    numberOfSelectionableOpt,
    isRelevant,
    hasMultipleOpenResponse,
    shouldMultiply,
    questionIdParent,
    addType,
    removeType,
    addProject,
    removeProject,
  } = req.body;

  // Check label or category to be not empty
  if (label === "" || category === "") {
    return res.status(400).json({ error: "label and category are required" });
  }

  try {
    const question = await questionService.updateQuestion(questionId, {
      label,
      category,
      numberOfSelectionableOpt,
      isRelevant,
      hasMultipleOpenResponse,
      shouldMultiply,
      questionIdParent,
      addType,
      removeType,
      addProject,
      removeProject,
    });
    res.status(200).json(question);
  } catch (error) {
    if (error.message === "Question not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error updating question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a question by ID.
 *
 * @async
 * @function deleteQuestion
 * @param {Object} req.params - Request params.
 * @param {string} req.params.questionId - The ID of the question to delete.
 * @returns {Promise<void>} Sends:
 * - 204: No Content, question deleted successfully.
 * - 404: Question not found.
 * - 500: Internal server error.
 */
module.exports.deleteQuestion = async (req, res) => {
  const { questionId } = req.params;

  try {
    await questionService.deleteQuestion(questionId);
    res.status(204).send();
  } catch (error) {
    if (error.message === "Question not found") {
      res.status(404).json({ error: error.message });
    }
    console.error("Error deleting question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a question by ID.
 *
 * @async
 * @function getQuestionById
 * @param {Object} req.params - Request params.
 * @param {string} req.params.questionId - The ID of the question to fetch.
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns the question object.
 * - 404: Question not found.
 * - 500: Internal server error.
 */
module.exports.getQuestionById = async (req, res) => {
  const { questionId } = req.params;

  try {
    const question = await questionService.getQuestionById(questionId);
    res.status(200).json(question);
  } catch (error) {
    if (error.message === "Question not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error fetching question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get questions by project ID.
 *
 * @async
 * @function getQuestionsByProject
 * @param {Object} req.params - Request params.
 * @param {string} req.params.projectId - The project ID to filter questions by.
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns an array of questions for the given project.
 * - 404: Project not found.
 * - 500: Internal server error.
 */
module.exports.getQuestionsByProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const questions = await questionService.getQuestionsByProject(projectId);
    res.status(200).json(questions);
  } catch (error) {
    if (error.message === "Project not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error fetching questions by project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get questions by category.
 *
 * @async
 * @function getQuestionsByCategory
 * @param {Object} req.params - Request params.
 * @param {string} req.params.category - The category to filter questions by.
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns an array of questions in the given category.
 * - 500: Internal server error.
 */
module.exports.getQuestionsByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const questions = await questionService.getQuestionsByCategory(category);
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions by category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get questions by type ID.
 *
 * @async
 * @function getQuestionsByType
 * @param {Object} req.params - Request params.
 * @param {string} req.params.typeId - The type ID to filter questions by.
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns an array of questions for the given type.
 * - 404: Type not found.
 * - 500: Internal server error.
 */
module.exports.getQuestionsByType = async (req, res) => {
  const { typeId } = req.params;

  try {
    const questions = await questionService.getQuestionsByType(typeId);
    res.status(200).json(questions);
  } catch (error) {
    if (error.message === "Type not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error fetching questions by type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get subquestions by parent question ID.
 *
 * @async
 * @function getSubQuestions
 * @param {Object} req.params - Request params.
 * @param {string} req.params.questionId - The parent question ID to fetch subquestions for.
 * @returns {Promise<void>} Sends:
 * - 200: OK, returns an array of subquestions.
 * - 404: Parent question not found.
 * - 500: Internal server error.
 */
module.exports.getSubQuestions = async (req, res) => {
  const { questionId } = req.params;
  try {
    const subQuestions = await questionService.getSubQuestions(questionId);
    res.status(200).json(subQuestions);
  } catch (error) {
    if (error.message === "QuestionParent not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error fetching sub-questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
