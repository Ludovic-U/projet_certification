const { Router } = require("express");
const optionController = require("../controllers/optionController");
const { validateId } = require("../middlewares/validateId");
const { authenticateUser } = require("../middlewares/auth");
const { isSuperAdmin } = require("../middlewares/isAdmin");

const router = Router();

// All option management routes require super_admin
router.post("/create", authenticateUser, isSuperAdmin, optionController.createOption);

router.get(
  "/get/question/:questionId",
  authenticateUser,
  isSuperAdmin,
  validateId("questionId"),
  optionController.getOptionsByQuestion
);
router.get(
  "/get/:optionId",
  authenticateUser,
  isSuperAdmin,
  validateId("optionId"),
  optionController.getOptionById
);

router.patch(
  "/update/:optionId",
  authenticateUser,
  isSuperAdmin,
  validateId("optionId"),
  optionController.updateOption
);

router.delete(
  "/delete/:optionId",
  authenticateUser,
  isSuperAdmin,
  validateId("optionId"),
  optionController.deleteOption
);

module.exports = router;
