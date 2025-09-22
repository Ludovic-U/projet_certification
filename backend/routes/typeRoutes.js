const { Router } = require("express");
const typeController = require("../controllers/typeController");
const { validateId } = require("../middlewares/validateId");

const router = Router();

router.post("/create", typeController.createType);

router.get("/get", typeController.getAllTypes);
router.get("/get/:typeId", validateId("typeId"), typeController.getTypeById);

router.patch(
  "/update/:typeId",
  validateId("typeId"),
  typeController.updateType
);

router.delete(
  "/delete/:typeId",
  validateId("typeId"),
  typeController.deleteType
);

module.exports = router;
