const { Router } = require("express");
const typeController = require("../controllers/typeController");
const router = Router();

router.post("/create", typeController.createType);

router.get("/get", typeController.getAllTypes);
router.get("/get/:typeId", typeController.getTypeById);

router.patch("/update/:typeId", typeController.updateType);

router.delete("/delete/:typeId", typeController.deleteType);

module.exports = router;
