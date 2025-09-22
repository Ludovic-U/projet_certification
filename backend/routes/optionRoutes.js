const { Router } = require("express");
const optionController = require("../controllers/optionController");
const { validateId } = require("../middlewares/validateId");

const router = Router();

router.post("/create", optionController.createOption);

router.get(
  "/get/question/:questionId",
  validateId("questionId"),
  optionController.getOptionsByQuestion
);
router.get(
  "/get/:optionId",
  validateId("optionId"),
  optionController.getOptionById
);

router.patch(
  "/update/:optionId",
  validateId("optionId"),
  optionController.updateOption
);

router.delete(
  "/delete/:optionId",
  validateId("optionId"),
  optionController.deleteOption
);

module.exports = router;
