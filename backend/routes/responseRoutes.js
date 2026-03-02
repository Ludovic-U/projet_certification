const { Router } = require("express");
const responseController = require("../controllers/responseController");
const { validateId } = require("../middlewares/validateId");
const { authenticateUser } = require("../middlewares/auth");
const { isSuperAdmin } = require("../middlewares/isAdmin");

const router = Router();

// Response routes require authentication
// Project-specific operations need authentication
router.post("/create", authenticateUser, responseController.createResponse);

router.get(
  "/get/:responseId/subresponse",
  authenticateUser,
  validateId("responseId"),
  responseController.getSubResponses
);
router.get(
  "/get/project/:projectId",
  authenticateUser,
  validateId("projectId"),
  responseController.getResponsesByProject
);
router.get(
  "/get/project/:projectId/question/:questionId",
  authenticateUser,
  validateId("projectId"),
  validateId("questionId"),
  responseController.getResponsesByQuestionOfProject
);

router.patch(
  "/update/:responseId",
  authenticateUser,
  validateId("responseId"),
  responseController.updateResponse
);

router.delete(
  "/delete/:responseId",
  authenticateUser,
  validateId("responseId"),
  responseController.deleteResponse
);

module.exports = router;
