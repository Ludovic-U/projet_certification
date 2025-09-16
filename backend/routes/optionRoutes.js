const { Router } = require("express");
const optionController = require("../controllers/optionController");
const router = Router();

router.post("/create", optionController.createOption);

router.get("/get/question/:questionId", optionController.getOptionsByQuestion);
router.get("/get/:optionId", optionController.getOptionById);

router.patch("/update/:optionId", optionController.updateOption);

router.delete("/delete/:optionId", optionController.deleteOption);

module.exports = router;
