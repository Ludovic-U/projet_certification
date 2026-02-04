const { Router } = require("express");
const questionController = require("../controllers/questionController");
const { validateId } = require("../middlewares/validateId");

const router = Router();

router.post("/create", questionController.createQuestion);

router.get("/get", questionController.getAllQuestions);
router.get("/categories", questionController.getAllCategories);
router.post("/categories", questionController.createCategory);
router.delete("/categories/:categoryId", questionController.deleteCategory);
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
  questionController.updateQuestion
);

router.delete(
  "/delete/:questionId",
  validateId("questionId"),
  questionController.deleteQuestion
);

module.exports = router;
