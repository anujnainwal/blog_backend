const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
    },
    email: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    password: {
      type: String,
      select: false,
      required: true,
    },
    postCount: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Admin", "User", "Blogger"],
    },
    isFollowing: {
      type: Boolean,
      default: false,
    },
    isUnFollowing: {
      type: Boolean,
      default: false,
    },
    isAccountVerifed: {
      type: Boolean,
      default: false,
    },
    accountActivationToken: String,
    accountActivationTokenExpire: Date,
    viwedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
      ],
    },
    followers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    following: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpire: Date,
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

//prefiend
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  let salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

//match password
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//generate Activation code by email
userSchema.methods.generateActivationToken = async function (email) {
  const verifcationToken = crypto.randomBytes(20).toString("hex");
  this.accountActivationToken = crypto
    .createHash("sha256")
    .update(verifcationToken)
    .digest("hex");
  this.accountActivationTokenExpire = Date.now() + 5 * 60 * 1000; // 5 mintutes
  return verifcationToken;
};

//setPasswordToken
userSchema.methods.resetToken = async function () {
  const resetToken = crypto.randomBytes(30).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpire = Date.now() + 5 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("Users", userSchema);
