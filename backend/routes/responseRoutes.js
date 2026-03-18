const { Router } = require("express");
const responseController = require("../controllers/responseController");
const { validateId } = require("../middlewares/validateId");
const { authenticateUser } = require("../middlewares/auth");
const { authorizeResource } = require("../middlewares/authorizeResource");
const { isSuperAdmin } = require("../middlewares/isAdmin");

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Create response - authorization handled in controller (projectId in body)
router.post("/create", responseController.createResponse);

// Get sub-responses by responseId - authorization handled in controller
router.get(
  "/get/:responseId/subresponse",
  validateId("responseId"),
  responseController.getSubResponses
);

// Get responses by project - requires project authorization
router.get(
  "/get/project/:projectId",
  authorizeResource('project'),
  validateId("projectId"),
  responseController.getResponsesByProject
);

// Get responses by project and question - requires project authorization
router.get(
  "/get/project/:projectId/question/:questionId",
  authorizeResource('project'),
  validateId("projectId"),
  validateId("questionId"),
  responseController.getResponsesByQuestionOfProject
);

// Update response - authorization handled in controller
router.patch(
  "/update/:responseId",
  validateId("responseId"),
  responseController.updateResponse
);

// Delete response - authorization handled in controller
router.delete(
  "/delete/:responseId",
  validateId("responseId"),
  responseController.deleteResponse
);

module.exports = router;
