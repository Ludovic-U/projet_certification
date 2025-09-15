const { Router } = require("express");
const questionController = require("../controllers/questionController");

const router = Router();

router.post("/create", questionController.createQuestion);

router.get("/get", questionController.getAllQuestions);
router.get("/get/:questionId", questionController.getQuestionById);
router.get("/get/:questionId/subquestion", questionController.getSubQuestions);

router.get("/get/project/:projectId", questionController.getQuestionsByProject);
router.get("/get/type/:typeId", questionController.getQuestionsByType);

router.get(
  "/get/category/:category",
  questionController.getQuestionsByCategory
);

router.patch("/update/:questionId", questionController.updateQuestion);

router.delete("/delete/:questionId", questionController.deleteQuestion);

module.exports = router;
