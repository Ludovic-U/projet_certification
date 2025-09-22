const { Router } = require("express");
const responseController = require("../controllers/responseController");
const { validateId } = require("../middlewares/validateId");

const router = Router();

router.post("/create", responseController.createResponse);

router.get(
  "/get/:responseId/subresponse",
  validateId("responseId"),
  responseController.getSubResponses
);
router.get(
  "/get/project/:projectId",
  validateId("projectId"),
  responseController.getResponsesByProject
);
router.get(
  "/get/project/:projectId/question/:questionId",
  validateId("projectId"),
  validateId("questionId"),
  responseController.getResponsesByQuestionOfProject
);

router.patch(
  "/update/:responseId",
  validateId("responseId"),
  responseController.updateResponse
);

router.delete(
  "/delete/:responseId",
  validateId("responseId"),
  responseController.deleteResponse
);

module.exports = router;
