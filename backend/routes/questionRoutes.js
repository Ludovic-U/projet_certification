const { Router } = require("express");
const questionController = require("../controllers/questionController");
const { validateId } = require("../middlewares/validateId");
const {
  createQuestionValidators,
  updateQuestionValidators,
} = require("../middlewares/inputValidators");

const router = Router();

router.post(
  "/create",
  createQuestionValidators,
  questionController.createQuestion
);

router.get("/get", questionController.getAllQuestions);
router.get(
  "/get/:questionId",
  validateId("questionId"),
  questionController.getQuestionById
);
router.get(
  "/get/:questionId/subquestion",
  validateId("questionId"),
  questionController.getSubQuestions
);

router.get(
  "/get/project/:projectId",
  validateId("projectId"),
  questionController.getQuestionsByProject
);
router.get(
  "/get/type/:typeId",
  validateId("typeId"),
  questionController.getQuestionsByType
);

router.get(
  "/get/category/:category",
  questionController.getQuestionsByCategory
);

router.patch(
  "/update/:questionId",
  validateId("questionId"),
  updateQuestionValidators,
  questionController.updateQuestion
);

router.delete(
  "/delete/:questionId",
  validateId("questionId"),
  questionController.deleteQuestion
);

module.exports = router;
