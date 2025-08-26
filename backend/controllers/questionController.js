const { PrismaClient } = require("@prisma/client");
const { isAdmin } = require("../utils/roles");
const prisma = new PrismaClient();

// Create a new question
module.exports.createQuestion = async (req, res) => {
  user = req.user;
  if (!isAdmin(user)) {
    return res.status(403).json({ error: "Forbidden ADMIN ONLY!!!" });
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
    const question = await prisma.question.create({
      data: {
        label: label,
        category: category,
        numberOfSelectionableOpt: numberOfSelectionableOpt ?? null,
        isRelevant: isRelevant ?? false,
        hasMultipleResponse: hasMultipleResponse ?? false,
        questionIdParent: questionIdParent ?? null,
      },
    });
    res.status(201).json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all questions
module.exports.getAllQuestions = async (req, res) => {
  user = req.user;
  if (!isAdmin(user)) {
    return res.status(403).json({ error: "Forbidden ADMIN ONLY!!!" });
  }
  try {
    const questions = await prisma.question.findMany();
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a question by ID
module.exports.updateQuestion = async (req, res) => {
  user = req.user;
  if (!isAdmin(user)) {
    return res.status(403).json({ error: "Forbidden ADMIN ONLY!!!" });
  }
  const { id } = req.params;
  const {
    label,
    category,
    numberOfSelectionableOpt,
    isRelevant,
    hasMultipleResponse,
    questionIdParent,
  } = req.body;
  try {
    const question = await prisma.question.update({
      where: { id: parseInt(id) },
      data: {
        label: label,
        category: category,
        numberOfSelectionableOpt: numberOfSelectionableOpt ?? null,
        isRelevant: isRelevant ?? false,
        hasMultipleResponse: hasMultipleResponse ?? false,
        questionIdParent: questionIdParent ?? null,
      },
    });
    res.status(200).json(question);
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a question by ID
module.exports.deleteQuestion = async (req, res) => {
  user = req.user;
  if (!isAdmin(user)) {
    return res.status(403).json({ error: "Forbidden ADMIN ONLY!!!" });
  }
  const { id } = req.params;
  try {
    await prisma.question.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a question by ID
module.exports.getQuestionById = async (req, res) => {
  user = req.user;
  if (!isAdmin(user)) {
    return res.status(403).json({ error: "Forbidden ADMIN ONLY!!!" });
  }
  const { id } = req.params;
  try {
    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) },
    });
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get questions by category
module.exports.getQuestionsByCategory = async (req, res) => {
  user = req.user;
  if (!isAdmin(user)) {
    return res.status(403).json({ error: "Forbidden ADMIN ONLY!!!" });
  }
  const { category } = req.params;
  try {
    const questions = await prisma.question.findMany({
      where: { category: category },
    });
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions by category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get questions by Type
module.exports.getQuestionsByType = async (req, res) => {
  user = req.user;
  if (!isAdmin(user)) {
    return res.status(403).json({ error: "Forbidden ADMIN ONLY!!!" });
  }
  const { typeId } = req.params;
  try {
    const questions = await prisma.question.findMany({
      where: { types: { some: { typeId: typeId } } },
    });
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions by type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get sub-questions of a parent question
module.exports.getSubQuestions = async (req, res) => {
  user = req.user;
  if (!isAdmin(user)) {
    return res.status(403).json({ error: "Forbidden ADMIN ONLY!!!" });
  }
  const { parentId } = req.params;
  try {
    const subQuestions = await prisma.question.findMany({
      where: { questionIdParent: parseInt(parentId) },
    });
    res.status(200).json(subQuestions);
  } catch (error) {
    console.error("Error fetching sub-questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
