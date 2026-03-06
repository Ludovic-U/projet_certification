const { Router } = require("express");
const typeController = require("../controllers/typeController");
const { validateId } = require("../middlewares/validateId");
const { authenticateUser } = require("../middlewares/auth");
const { isSuperAdmin } = require("../middlewares/isAdmin");

const router = Router();

// All type management routes require super_admin
router.post("/create", authenticateUser, isSuperAdmin, typeController.createType);

router.get("/get", authenticateUser, isSuperAdmin, typeController.getAllTypes);
router.get("/get/:typeId", authenticateUser, isSuperAdmin, validateId("typeId"), typeController.getTypeById);

router.patch(
  "/update/:typeId",
  authenticateUser,
  isSuperAdmin,
  validateId("typeId"),
  typeController.updateType
);

router.delete(
  "/delete/:typeId",
  authenticateUser,
  isSuperAdmin,
  validateId("typeId"),
  typeController.deleteType
);

module.exports = router;
