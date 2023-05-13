const express = require("express");
const postController = require("../controller/post/post.controller");
const { isAuthenticated } = require("../middleware/jwt-verify");
const postImageUtils = require("../utils/multer/upload");
const router = express.Router();

router.post(
  "/createPost",
  isAuthenticated,
  postImageUtils.upload.single("postImage"),
  postImageUtils.postImageResize,
  postController.createPost
);
router.get("/allPost", postController.fetchAllPost);
router.get("/post/:id", postController.singlePost);
router.put("/updatePost/:id", isAuthenticated, postController.updatePost);
router.delete("/deletePost/:id", isAuthenticated, postController.deletePost);
router.post("/like", isAuthenticated, postController.userLike);
router.post("/dislike", isAuthenticated, postController.userDislike);
module.exports = router;
