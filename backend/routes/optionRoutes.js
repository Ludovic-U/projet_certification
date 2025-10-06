const { Router } = require("express");
const optionController = require("../controllers/optionController");
const { validateId } = require("../middlewares/validateId");
const {
  createOptionValidators,
  updateOptionValidators,
} = require("../middlewares/inputValidators");

const router = Router();

router.post("/create", createOptionValidators, optionController.createOption);

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
  updateOptionValidators,
  optionController.updateOption
);

router.delete(
  "/delete/:optionId",
  validateId("optionId"),
  optionController.deleteOption
);

module.exports = router;
