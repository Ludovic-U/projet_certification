const { Router } = require("express");
const questionController = require("../controllers/questionController");
const { validateId } = require("../middlewares/validateId");
const { authenticateUser } = require("../middlewares/auth");
const { isSuperAdmin } = require("../middlewares/isAdmin");

const router = Router();

// All question management routes require super_admin
router.post("/create", authenticateUser, isSuperAdmin, questionController.createQuestion);

router.get("/get", authenticateUser, isSuperAdmin, questionController.getAllQuestions);
router.get("/categories", authenticateUser, isSuperAdmin, questionController.getAllCategories);
router.post("/categories", authenticateUser, isSuperAdmin, questionController.createCategory);
router.delete("/categories/:categoryId", authenticateUser, isSuperAdmin, questionController.deleteCategory);
router.get(
  "/get/:questionId",
  authenticateUser,
  isSuperAdmin,
  validateId("questionId"),
  questionController.getQuestionById
);
router.get(
  "/get/:questionId/subquestion",
  authenticateUser,
  isSuperAdmin,
  validateId("questionId"),
  questionController.getSubQuestions
);

router.get(
  "/get/project/:projectId",
  authenticateUser,
  isSuperAdmin,
  validateId("projectId"),
  questionController.getQuestionsByProject
);
router.get(
  "/get/type/:typeId",
  authenticateUser,
  isSuperAdmin,
  validateId("typeId"),
  questionController.getQuestionsByType
);

router.get(
  "/get/category/:category",
  authenticateUser,
  isSuperAdmin,
  questionController.getQuestionsByCategory
);

router.patch(
  "/update/:questionId",
  authenticateUser,
  isSuperAdmin,
  validateId("questionId"),
  questionController.updateQuestion
);

router.delete(
  "/delete/:questionId",
  authenticateUser,
  isSuperAdmin,
  validateId("questionId"),
  questionController.deleteQuestion
);

module.exports = router;
