const userModel = require("../../model/user.model");
const mongoose = require("mongoose");
const crypto = require("crypto");
const joi = require("joi");
const generateToken = require("../../token/generateToken");
const {
  registerValidation,
  loginValidation,
  profileUpdate,
  checkPassword,
} = require("../../utils/validation/validation");
const sendEmail = require("../../utils/sendMail/sendMail");
const uploadImageCloudinary = require("../../utils/cloudinary/cloudinary");
const path = require("path");
const TokenModel = require("../../model/token.model");

/*
    @route register api/v1/user/register
    @desc user registration
    @access private
*/
exports.Register = async (req, res, next) => {
  const { error, value } = registerValidation.validate(req.body, userModel, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const { firstname, lastname, email, password } = value;
    //check if email already exist or not.
    const duplicateEmail = await userModel.findOne({ email: email });
    if (duplicateEmail) {
      return res.status(400).json({
        error: `This ${email} address already register.Please try with new email.`,
      });
    }
    const user = new userModel({
      firstname,
      lastname,
      email,
      password,
    });
    await user.save();

    return res
      .status(200)
      .json({ message: "user registeration.", userInfo: user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route login api/v1/user/login
    @desc user login
    @access private
*/
exports.Login = async (req, res, next) => {
  const { error, value } = loginValidation.validate(req.body, userModel, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const { email, password } = value;
    const checkEmail = await userModel
      .findOne({ email: email })
      .select("+password");

    if (!checkEmail) {
      return res.status(404).json({ error: `This ${email} not found.` });
    }
    const matchPassword = await checkEmail.matchPassword(password);
    if (!matchPassword) {
      return res.status(401).json({ error: "Invalid Credentails." });
    }
    const accessToken = await generateToken.accessToken(checkEmail);
    return res.status(200).json({
      status: 1,
      message: "Login successfully.",
      userInfo: checkEmail,
      accessToken: accessToken,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route fetch api/v1/user/all-users
    @desc See All users
    @access public
*/
exports.fetchAllUser = async (req, res, next) => {
  const user = await userModel.find().sort({ createAt: 1 });
  try {
    if (user?.length < 0) {
      return res.status(400).json({ status: 0, message: "No user Found." });
    }
    return res
      .status(200)
      .json({ status: 1, message: "Fetch All user", users: user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route delete api/v1/user/:id
    @desc delete users
    @access delete
*/
exports.deleteUser = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ status: 0, error: "Invalid user id." });
  }
  try {
    const user = await userModel.findByIdAndDelete({ _id: id });
    if (!user) {
      return res.status(400).json({ status: 0, error: "User not found." });
    }
    return res.status(200).json({
      status: 1,
      messae: `The user with this ID="${id}" has been deleted successfully.`,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route Single api/v1/user/:id
    @desc fetch single user
    @access public
*/
exports.singleUser = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ status: 0, error: "Invalid user id." });
  }
  try {
    const user = await userModel.findById({ _id: id });
    if (!user) {
      return res.status(400).json({ status: 0, error: "User not found." });
    }
    return res.status(200).json({
      status: 1,
      messae: `Single user fetch.`,
      userInfo: user,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route profile api/v1/user/profile/:id
    @desc userprofile user
    @access public
*/
exports.userProfile = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ status: 0, error: "Invalid user id." });
  }
  try {
    const user = await userModel.findById({ _id: id });
    if (!user) {
      return res.status(400).json({ status: 0, error: "User not found." });
    }
    return res.status(200).json({
      status: 1,
      messae: `Single user fetch.`,
      userInfo: user,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route update Profile api/v1/user/update/:id
    @desc user profile user
    @access public
*/
exports.updateProfile = async (req, res, next) => {
  const { _id } = req.user;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ status: 0, error: "Invalid user id." });
  }
  const { error, value } = profileUpdate.validate(req.body, userModel);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const { firstname, lastname, email, bio } = value;
    const user = await userModel.findByIdAndUpdate(
      _id,
      {
        firstname: firstname,
        lastname: lastname,
        email: email,
        bio: bio,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      status: 1,
      message: "Profile Update succesfully. ",
      userInfo: user,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route update Profile api/v1/user/changePassword/
    @desc user update password
    @access private
*/
exports.changePassword = async (req, res, next) => {
  const { _id } = req.user;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ status: 0, error: "Invalid user id." });
  }
  const { error, value } = checkPassword.validate(req.body, userModel);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const user = await userModel.findById(_id).select("+password");
  try {
    const { newPassword, currentPassword } = value;

    const currentPasswordValid = await user.matchPassword(currentPassword);
    if (!currentPasswordValid) {
      return res.status(400).json({ status: 0, error: "Invalid Password" });
    }

    const newPasswordvalid = await user.matchPassword(newPassword);
    if (newPasswordvalid) {
      return res.status(400).json({
        status: 0,
        error: "New password cannot be same as current password.",
      });
    }

    user.password = newPassword;
    await user.save();
    return res.status(200).json({
      status: 1,
      message: "Password successfully updated.",
      userInfo: user,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route update userFollow api/v1/user/userFollow/
    @desc user Follow
    @access private
*/
exports.userFollowing = async (req, res, next) => {
  const loginId = req.user._id;
  const { followId } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(loginId) ||
    !mongoose.Types.ObjectId.isValid(followId)
  ) {
    return res.status(400).json({ status: 0, error: "Invalid user id." });
  }

  try {
    const targetUser = await userModel.findById(followId);

    const alreadyFollowed = targetUser?.followers.find(
      (user) => user.toString() === loginId.toString()
    );

    if (alreadyFollowed) {
      return res
        .status(400)
        .json({ status: 0, error: `you have already follow this user.` });
    }
    //1. Find the user you want to follow and update it's followers field
    await userModel.findByIdAndUpdate(
      followId,
      {
        $push: { followers: loginId },
      },
      {
        new: true,
      }
    );
    // /2. Update the login user following field
    const user = await userModel.findByIdAndUpdate(
      loginId,
      {
        $push: {
          following: followId,
        },
        isFollowing: true,
      },
      {
        new: true,
      }
    );
    await user.save();
    return res.status(200).json({
      status: 1,
      message: "You successfully followed this person.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route unfollow user api/v1/user/unfollow/
    @desc user unfollow
    @access private
*/
exports.unfollowUser = async (req, res, next) => {
  const loginId = req.user._id;
  const { unFollowId } = req.body;
  if (
    !mongoose.Types.ObjectId.isValid(loginId) ||
    !mongoose.Types.ObjectId.isValid(unFollowId)
  ) {
    return res.status(400).json({ status: 0, error: "Invalid user id." });
  }
  try {
    await userModel.findByIdAndUpdate(
      unFollowId,
      {
        $pull: {
          followers: loginId,
        },
        isFollowing: false,
      },
      {
        new: true,
      }
    );
    await userModel.findByIdAndUpdate(
      loginId,
      {
        $pull: {
          following: unFollowId,
        },
        isFollowing: false,
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json({ message: "You have successfully unfollowed this user." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route isBlocked user api/v1/user/blocked/
    @desc user blocked
    @access private
*/
exports.isBlocked = async (req, res, next) => {
  const blockedId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(blockedId)) {
    return res.status(400).json({ error: "Invlaid user id" });
  }
  try {
    const user = await userModel.findById(blockedId);
    if (user.isBlocked === true) {
      return res
        .status(400)
        .json({ status: 0, error: `This user already blocked.` });
    }
    user.isBlocked = true;
    await user.save();

    return res.status(200).json({ message: "This user has been blocked." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route unblock user api/v1/user/unblocked/
    @desc user unblocked
    @access private
*/
exports.isUnBlocked = async (req, res, next) => {
  const blockedId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(blockedId)) {
    return res.status(400).json({ error: "Invlaid user id" });
  }
  try {
    const user = await userModel.findById(blockedId);
    if (user.isBlocked === false) {
      return res.status(404).json({ error: "This user already unblocked." });
    }
    user.isBlocked = false;
    await user.save();
    return res.status(200).json({ message: "unblocked user successfully." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route activation email user api/v1/user/activation email/
    @desc user activation
    @access private
*/
exports.getActivationEmail = async (req, res, next) => {
  let userID = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return res.status(400).json({ error: "Invalid user Id." });
  }
  try {
    const user = await userModel.findById(userID);
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }
    const verifcationToken = await user.generateActivationToken();

    await user.save();

    let email = "anujsinghnainwal@gmail.com";
    let subject = "Email Activation Token";
    let content =
      "Please click on the button to complete the verification process for xxxxxx@xxxx.xxx:";
    let companName = "Block System";
    let username = `${user.firstname} ${user.lastname}`;
    let title = "Email Activation";
    let buttonContent = "Verify your email address";
    let resetUrl = `http://localhost:3000/token=${verifcationToken}`;
    await sendEmail(
      email,
      subject,
      content,
      companName,
      username,
      title,
      buttonContent,
      resetUrl
    );
    return res
      .status(200)
      .json({ message: "Email Activation code send in your email address." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route activation by param email user api/v1/user/activation email/
    @desc user activation
    @access private
*/
exports.isActivatedEmail = async (req, res, next) => {
  let { token } = req.params;
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");
  try {
    const userFound = await userModel.findOne({
      accountActivationToken: hashToken,
      accountActivationTokenExpire: { $gte: Date.now() },
    });
    if (!userFound) {
      return res
        .status(400)
        .json({ error: "Token was expire. Please generate new one." });
    }
    userFound.isAccountVerifed = true;
    userFound.accountActivationToken = undefined;
    userFound.accountActivationTokenExpire = undefined;
    await userFound.save();
    return res
      .status(200)
      .json({ status: 1, message: "Email verification successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/*
    @route forgetPassword user api/v1/user/forgetPassword
    @desc user forget Password
    @access public
*/
exports.forgetPassword = async (req, res, next) => {
  const emailValid = joi.object({
    email: joi.string().min(5).max(50).required().email(),
  });
  let { error, value } = emailValid.validate(req.body, userModel);
  try {
    if (error) {
      return res.status(500).json({ error: error.details[0].message });
    }
    const user = await userModel.findOne({ email: value.email }).exec();
    if (!user) {
      return res.status(404).json({ error: `This ${value.email} not found.` });
    }
    //main logic start
    const token = await user.resetToken();
    await user.save();
    let email = "anujsinghnainwal@gmail.com";
    let subject = "Reset Password Token";
    let content = "Please click on the button to complete the reset password.";
    let companName = "Block System";
    let username = `${user.firstname} ${user.lastname}`;
    let title = "Email Activation";
    let buttonContent = "Reset Password";
    let resetUrl = `http://localhost:3000/resetPassword/${token}`;
    await sendEmail(
      email,
      subject,
      content,
      companName,
      username,
      title,
      buttonContent,
      resetUrl
    );
    return res.status(200).json({
      message: "Password reset link successfully sent in your email account.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
};
/*
    @route forgetPassword user api/v1/user/forgetPassword
    @desc user forget Password
    @access public
*/
exports.resetPassword = async (req, res, next) => {
  let { token } = req.params;
  const joiPassword = joi.object({
    password: joi.string().min(8).max(50).required().trim(),
  });
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");
  try {
    const user = await userModel.findOne({
      passwordResetToken: hashToken,
      passwordResetTokenExpire: { $gt: Date.now() },
    });
    // if no user found, token is invalid or expired
    if (!user) {
      return res
        .status(400)
        .json({ message: "Reset Token was expired please generate new One." });
    }
    // update the user's password with the new password
    let { error, value } = joiPassword.validate(req.body, userModel);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    user.password = value.password;

    // clear the resetToken and resetExpires fields
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;

    // save the user and return success message
    await user.save();

    return res.json({
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

exports.profileUpdate = async (req, res, next) => {
  const loginId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(loginId)) {
    return res.status(400).json({ error: "Inavlid Id" });
  }
  try {
    const localPath = path.join(
      __dirname,
      "..",
      "..",
      `/public/images/profile/${req.file.filename}`
    );
    const uploadImage = await uploadImageCloudinary.cloudinaryUploadImage(
      localPath,
      `userProfile`
    );
    const userFound = await userModel.findById(loginId);
    userFound.profilePic = uploadImage?.url;
    await userFound.save();
    return res.status(200).json({
      message: "Profile Pic Upload successfully",
      userInfo: userFound,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async () => {
  try {
    const { refreshToken, userId, role } = req.body;
    if (!ObjecId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid Id" });
    }
    const token = await TokenModel.findOne({ refreshToken: refreshToken });
    if (!token) {
      return res.status(404).json({ error: "Token not found" });
    }
    if (token.used) {
      return res.status(400).json({ error: "Token already used" });
    }
    if (token.expireAt < new Date()) {
      await TokenModel.deleteOne({ refreshToken });
      return res
        .status(400)
        .json({ error: "Token was expired. Please login again." });
    }
    const user = {
      _id: userId,
      role: role,
    };
    const accessToken = await generateToken.ACCESS_TOKEN(user);
    token.used = true;
    await token.save();
    return res.json({
      status: 1,
      accessToken,
      message: "Token used successfully",
    });
  } catch (error) {
    console.log(error);
  }
};
