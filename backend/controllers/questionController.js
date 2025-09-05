const questionService = require("../services/questionService");

/**
 * Create a new question.
 * Expects the following fields in req.body:
 * - label: String
 * - category: String
 * - numberOfSelectionableOpt: Number (optional)
 * - isRelevant: Boolean (optional)
 * - hasMultipleResponse: Boolean (optional)
 * - questionIdParent: Number (optional)
 */
module.exports.createQuestion = async (req, res) => {
  const {
    label,
    category,
    numberOfSelectionableOpt,
    isRelevant,
    hasMultipleResponse,
    questionIdParent,
  } = req.body;

  try {
    const question = await questionService.createQuestion({
      label,
      category,
      numberOfSelectionableOpt: numberOfSelectionableOpt ?? null,
      isRelevant: isRelevant ?? false,
      hasMultipleResponse: hasMultipleResponse ?? false,
      questionIdParent: questionIdParent ?? null,
    });
    res.status(201).json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all questions.
 * Responds with an array of all questions.
 */
module.exports.getAllQuestions = async (_, res) => {
  try {
    const questions = await questionService.getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a question by ID.
 * Expects questionId in req.params and updated fields in req.body.
 * Responds with the updated question.
 */
module.exports.updateQuestion = async (req, res) => {
  const questionId = Number(req.params.questionId);
  // Validate questionId
  if (!Number.isInteger(questionId) || questionId <= 0) {
    return res.status(400).json({ error: "Invalid questionId" });
  }

  const {
    label,
    category,
    numberOfSelectionableOpt,
    isRelevant,
    hasMultipleResponse,
    questionIdParent,
  } = req.body;

  try {
    const question = await questionService.updateQuestion(questionId, {
      label,
      category,
      numberOfSelectionableOpt: numberOfSelectionableOpt ?? null,
      isRelevant: isRelevant ?? false,
      hasMultipleResponse: hasMultipleResponse ?? false,
      questionIdParent: questionIdParent ?? null,
    });
    res.status(200).json(question);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Question not found" });
    }
    console.error("Error updating question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a question by ID.
 * Expects questionId in req.params.
 * Responds with 204 No Content on success.
 */
module.exports.deleteQuestion = async (req, res) => {
  const questionId = Number(req.params.questionId);
  // Validate questionId
  if (!Number.isInteger(questionId) || questionId <= 0) {
    return res.status(400).json({ error: "Invalid questionId" });
  }

  try {
    await questionService.deleteQuestion(questionId);
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Question not found" });
    }
    console.error("Error deleting question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a question by ID.
 * Expects questionId in req.params.
 * Responds with the question object.
 */
module.exports.getQuestionById = async (req, res) => {
  const questionId = Number(req.params.questionId);
  // Validate questionId
  if (!Number.isInteger(questionId) || questionId <= 0) {
    return res.status(400).json({ error: "Invalid questionId" });
  }

  try {
    const question = await questionService.getQuestionById(questionId);
    res.status(200).json(question);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Question not found" });
    }
    console.error("Error fetching question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get questions by project.
 * Expects projectId in req.params.
 * Responds with an array of questions for the given project.
 */
module.exports.getQuestionsByProject = async (req, res) => {
  const projectId = Number(req.params.projectId);
  // Validate projectId
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: "Invalid projectId" });
  }

  try {
    const questions = await questionService.getQuestionsByProject(projectId);
    res.status(200).json(questions);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Project not found" });
    }
    console.error("Error fetching questions by project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get questions by category.
 * Expects category in req.params.
 * Responds with an array of questions in the given category.
 */
module.exports.getQuestionsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const questions = await questionService.getQuestionsByCategory(category);
    res.status(200).json(questions);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }
    console.error("Error fetching questions by category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get questions by type.
 * Expects typeId in req.params.
 * Responds with an array of questions for the given type.
 */
module.exports.getQuestionsByType = async (req, res) => {
  const typeId = Number(req.params.typeId);
  // Validate typeId
  if (!Number.isInteger(typeId) || typeId <= 0) {
    return res.status(400).json({ error: "Invalid typeId" });
  }

  try {
    const questions = await questionService.getQuestionsByType(typeId);
    res.status(200).json(questions);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Type not found" });
    }
    console.error("Error fetching questions by type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get subquestions by parent question ID.
 * Expects questionIdParent in req.params.
 * Responds with an array of subquestions.
 */
module.exports.getSubQuestions = async (req, res) => {
  const questionIdParent = Number(req.params.questionIdParent);
  // Validate questionIdParent
  if (!Number.isInteger(questionIdParent) || questionIdParent <= 0) {
    return res.status(400).json({ error: "Invalid questionIdParent" });
  }

  try {
    const subQuestions = await questionService.getSubQuestions(
      parseInt(questionIdParent)
    );
    res.status(200).json(subQuestions);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "QuestionParent not found" });
    }
    console.error("Error fetching sub-questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
