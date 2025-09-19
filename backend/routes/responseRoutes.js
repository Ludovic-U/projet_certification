const { Router } = require("express");
const responseController = require("../controllers/responseController");
const router = Router();

router.post("/create", responseController.createResponse);

router.get("/get/:responseId/subresponse", responseController.getSubResponses);
router.get("/get/project/:projectId", responseController.getResponsesByProject);
router.get(
  "/get/project/:projectId/question/:questionId",
  responseController.getResponsesByQuestionOfProject
);

router.patch("/update/:responseId", responseController.updateResponse);

router.delete("/delete/:responseId", responseController.deleteResponse);

module.exports = router;
