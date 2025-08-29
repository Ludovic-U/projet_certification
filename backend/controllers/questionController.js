const questionService = require("../services/questionService");

// Create a new question
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
      label: label,
      category: category,
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

// Get all questions
module.exports.getAllQuestions = async (_, res) => {
  try {
    const questions = await questionService.getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a question by ID
module.exports.updateQuestion = async (req, res) => {
  const { questionId } = req.params;
  // check if id is a number
  if (isNaN(questionId)) {
    return res.status(400).json({ error: "Bad request: Invalid questionId" });
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
      label: label,
      category: category,
      numberOfSelectionableOpt: numberOfSelectionableOpt ?? null,
      isRelevant: isRelevant ?? false,
      hasMultipleResponse: hasMultipleResponse ?? false,
      questionIdParent: questionIdParent ?? null,
    });
    res.status(200).json(question);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: "Question not found" });
    }
    console.error("Error updating question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a question by ID
module.exports.deleteQuestion = async (req, res) => {
  const { questionId } = req.params;
  // check if id is a number
  if (isNaN(questionId)) {
    return res.status(400).json({ error: "Bad request: Invalid questionId" });
  }

  try {
    await questionService.deleteQuestion(questionId);
    res.status(204).send();
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: "Question not found" });
    }
    console.error("Error deleting question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a question by ID
module.exports.getQuestionById = async (req, res) => {
  const { questionId } = req.params;
  // check if id is a number
  if (isNaN(questionId)) {
    return res.status(400).json({ error: "Bad request: Invalid questionId" });
  }

  try {
    const question = await questionService.getQuestionById(questionId);
    res.status(200).json(question);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: "Question not found" });
    }
    console.error("Error fetching question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// // Get a question by ID
// module.exports.getQuestionById = async (req, res) => {
//   const { questionId } = req.params;
//   // check if id is a number
//   if (isNaN(questionId)) {
//     return res.status(400).json({ error: "Bad request" });
//   }

//   try {
//     // Retrieve question if exists
//     const question = await prisma.question.findUnique({
//       where: { questionId: parseInt(questionId) },
//     });
//     if (!question) {
//       return res.status(404).json({ error: "Question not found" });
//     }
//     res.status(200).json(question);
//   } catch (error) {
//     console.error("Error fetching question:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// // Get questions by project
// module.exports.getQuestionsByProject = async (req, res) => {
//   const { projectId } = req.params;
//   // check if projectId is a number
//   if (isNaN(parseInt(projectId))) {
//     return res.status(400).json({ error: "Bad request" });
//   }

//   try {
//     // Retrieve questions specific to a project
//     const questions = await prisma.question.findMany({
//       where: { projects: { some: { projectId: projectId } } },
//     });

//     //TODO: Retrieve questions linked to types associated with the project

//     res.status(200).json(questions);
//   } catch (error) {
//     console.error("Error fetching questions by project:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// // Get questions by category
// module.exports.getQuestionsByCategory = async (req, res) => {
//   const { category } = req.params;
//   try {
//     const questions = await prisma.question.findMany({
//       where: { category: category },
//     });
//     res.status(200).json(questions);
//   } catch (error) {
//     console.error("Error fetching questions by category:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// // Get questions by Type
// module.exports.getQuestionsByType = async (req, res) => {
//   const { typeId } = req.params;
//   // check if typeId is a number
//   if (isNaN(parseInt(typeId))) {
//     return res.status(400).json({ error: "Bad request" });
//   }

//   try {
//     const questions = await prisma.question.findMany({
//       where: { types: { some: { typeId: typeId } } },
//     });
//     res.status(200).json(questions);
//   } catch (error) {
//     console.error("Error fetching questions by type:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// // Get sub-questions of a parent question
// module.exports.getSubQuestions = async (req, res) => {
//   const { parentId } = req.params;
//   // check if parentId is a number
//   if (isNaN(parseInt(parentId))) {
//     return res.status(400).json({ error: "Bad request" });
//   }

//   try {
//     const subQuestions = await prisma.question.findMany({
//       where: { questionIdParent: parseInt(parentId) },
//     });
//     res.status(200).json(subQuestions);
//   } catch (error) {
//     console.error("Error fetching sub-questions:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
