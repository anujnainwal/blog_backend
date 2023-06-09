const express = require("express");
const router = express.Router();
const userController = require("../controller/user/user.controller");
const { isAuthenticated } = require("../middleware/jwt-verify");
const profileUpdate = require("../utils/multer/upload");

router.post("/register", userController.Register);
router.post("/login", userController.Login);
router.get("/list", isAuthenticated, userController.fetchAllUser);
router.put("/profile/:id", isAuthenticated, userController.updateProfile);
router.post("/follow", isAuthenticated, userController.userFollowing);
router.post("/blocked/:id", isAuthenticated, userController.isBlocked);
router.put("/resetPassword", userController.resetPassword);
router.post("/refreshToken", userController.refreshToken);
router.get("/forgetPassword", userController.forgetPassword);
router.get(
  "/generateActivationToken",
  isAuthenticated,
  userController.getActivationEmail
);
router.put(
  "/uploadProfilePic",
  isAuthenticated,
  profileUpdate.upload.single("profilePic"),
  profileUpdate.profilePicResize,
  userController.profileUpdate
);
router.put("/resetPassword/:token", userController.resetPassword);
router.put("/emailActivationToken/:token", userController.isActivatedEmail);
router.post("/unBlocked/:id", isAuthenticated, userController.isUnBlocked);
router.post("/unfollow", isAuthenticated, userController.unfollowUser);
router.put("/changePassword", isAuthenticated, userController.changePassword);
router.delete("/:id", userController.deleteUser);
router.get("/:id", userController.singleUser);

module.exports = router;
