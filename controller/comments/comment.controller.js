const mongoose = require("mongoose");
const commentModel = require("../../model/comment.model.js");
const joi = require("joi");
exports.create = async (req, res, next) => {
  const loginId = req.user._id;
  const { description, postId } = req.body;
  if (
    !mongoose.Types.ObjectId.isValid(postId) ||
    !mongoose.Types.ObjectId.isValid(loginId)
  ) {
    return res.status(200).json({ error: "Invalid id" });
  }
  const descriptions = joi.object({
    postId: joi.string().required(),
    description: joi.string().min(5).max(300).required(),
  });
  try {
    let { error, value } = descriptions.validate(req.body, commentModel);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    let { postId, description } = value;
    const comment = new commentModel({
      postId: postId,
      userId: loginId,
      description: description,
    });
    await comment.save();
    return res
      .status(200)
      .json({ message: "Comment Add successfully.", commentInfo: comment });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.commentById = async (req, res, next) => {
  let commentId = req.params.id;
  try {
    const comment = await commentModel
      .findById(commentId)
      .populate("postId")
      .populate("userId");
    if (comment?.length < 0) {
      return res.status(400).json({ error: "Comment not found" });
    }
    return res
      .status(200)
      .json({ message: "Fetched fetched.", commentInfo: comment });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.fetchAllComment = async (req, res, next) => {
  try {
    const comment = await commentModel
      .find()
      .populate("postId")
      .populate("userId")
      .sort("-createAt");
    if (comment?.length < 0) {
      return res.status(400).json({ error: "Comment not found" });
    }
    return res
      .status(200)
      .json({ message: "Comment successfully fetched.", commentInfo: comment });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.updateComment = async (req, res, next) => {
  const loginId = req.user._id;
  const commentId = req.params.id;
  const description = req.body.description;
  const postId = req.body.postId;
  if (
    !mongoose.Types.ObjectId.isValid(loginId) ||
    !mongoose.Types.ObjectId.isValid(commentId) ||
    !mongoose.Types.ObjectId.isValid(postId)
  ) {
    return res.status(400).json({ error: "Invalid Id" });
  }
  if (description.length < 5 || description === "") {
    return res.status(400).json({ error: "description is to short." });
  }
  const updateComment = await commentModel.findByIdAndUpdate(commentId, {
    postId: postId,
    userId: loginId,
    description: description,
  });
  await updateComment.save();
  return res
    .status(200)
    .json({ message: "Comment update", commentInfo: updateComment });
  try {
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.deleteComment = async (req, res, next) => {
  let deleteId = req.params.id;
  let loginId = req.user._id;
  try {
    const comment = await commentModel.findByIdAndDelete(deleteId);
    if (!comment) {
      return res
        .status(400)
        .json({ error: "Comment not found. OR comment already deleted." });
    }
    return res.status(200).json({ message: "comment deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
