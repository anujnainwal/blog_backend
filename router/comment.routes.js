const express = require("express");
const { isAuthenticated } = require("../middleware/jwt-verify");
const commentController = require("../controller/comments/comment.controller");
const router = express.Router();

router.post("/create", isAuthenticated, commentController.create);
router.get("/allComments", commentController.fetchAllComment);
router.get("/:id", commentController.commentById);
router.put(
  "/updateComment/:id",
  isAuthenticated,
  commentController.updateComment
);
router.delete(
  "/deleteComment/:id",
  isAuthenticated,
  commentController.deleteComment
);

module.exports = router;
