const joi = require("joi");
const mongoose = require("mongoose");

const registerValidation = joi.object({
  firstname: joi.string().min(3).max(50).required(),
  lastname: joi.string().min(3).max(50).required(),
  email: joi.string().min(5).max(50).required().trim().lowercase(),
  password: joi.string().min(8).max(50).required(),
});

const loginValidation = joi.object({
  email: joi.string().min(5).max(50).required().trim().lowercase(),
  password: joi.string().required(),
});

const checkValidId = async (mongooseId) => {
  const isvalid = mongoose.Types.ObjectId.isValid(mongooseId);
  if (!isvalid) throw new Error(`Invalid user id.`);
};

const profileUpdate = joi.object({
  firstname: joi.string().min(3).max(50),
  lastname: joi.string().min(5).max(50),
  email: joi.string().min(5).max(50).email(),
  bio: joi.string().min(10).max(2000),
});

const checkPassword = joi.object({
  currentPassword: joi.string().min(8).max(50).required().trim(),
  newPassword: joi.string().min(8).max(50).required().trim(),
});

const createPostvalidation = joi.object({
  title: joi.string().min(1).max(40).required().trim().normalize(),
  description: joi.string().min(10).max(1000).required().trim().normalize(),
  // author: joi.string().required().trim(),
  category: joi.string().required().min(3).max(200).trim(),
});

module.exports = {
  registerValidation,
  loginValidation,
  checkValidId,
  checkPassword,
  createPostvalidation,
  profileUpdate,
};
