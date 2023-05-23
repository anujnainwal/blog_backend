const express = require("express");
const { isAuthenticated } = require("../middleware/jwt-verify");
const categoryController = require("../controller/category/category.controller");
const router = express.Router();

router.post("/create", isAuthenticated, categoryController.create);
router.get("/allcategorys", categoryController.fetchAllcategory);
router.get("/:id", categoryController.categoryById);
router.put(
  "/updatecategory/:id",
  isAuthenticated,
  categoryController.updatecategory
);
router.delete(
  "/deletecategory/:id",
  isAuthenticated,
  categoryController.deletecategory
);

module.exports = router;
