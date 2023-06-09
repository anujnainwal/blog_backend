const mongoose = require("mongoose");
const categoryModel = require("../../model/category.model");
const joi = require("joi");
exports.create = async (req, res, next) => {
  const loginId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(loginId)) {
    return res.status(200).json({ error: "Invalid id" });
  }
  const descriptions = joi.object({
    title: joi.string().min(5).max(100).required(),
  });
  try {
    let { error, value } = descriptions.validate(req.body, categoryModel);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    let { title } = value;
    const category = new categoryModel({
      userId: loginId,
      title: title,
    });
    await category.save();
    return res
      .status(200)
      .json({ message: "category Add successfully.", categoryInfo: category });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.categoryById = async (req, res, next) => {
  let categoryId = req.params.id;
  try {
    const category = await categoryModel
      .findById(categoryId)
      .populate("postId")
      .populate("userId");
    if (category?.length < 0) {
      return res.status(400).json({ error: "category not found" });
    }
    return res
      .status(200)
      .json({ message: "Fetched fetched.", categoryInfo: category });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.fetchAllcategory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the page number from the request query parameters
    const limit = parseInt(req.query.limit) || 10; // Set the number of items to display per page

    const totalCount = await categoryModel.countDocuments(); // Get the total count of categories
    const totalPages = Math.ceil(totalCount / limit); // Calculate the total number of pages based on the limit

    const skip = (page - 1) * limit; // Calculate the number of items to skip

    const category = await categoryModel
      .find()
      .populate("userId")
      .sort("-createAt")
      .skip(skip)
      .limit(limit);

    if (category?.length < 1) {
      return res.status(400).json({ error: "No categories found" });
    }

    return res.status(200).json({
      message: "Categories successfully fetched.",
      categoryInfo: category,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updatecategory = async (req, res, next) => {
  const loginId = req.user._id;
  const categoryId = req.params.id;
  const title = req.body.title;
  const postId = req.body.postId;
  if (
    !mongoose.Types.ObjectId.isValid(loginId) ||
    !mongoose.Types.ObjectId.isValid(categoryId)
  ) {
    return res.status(400).json({ error: "Invalid Id" });
  }
  if (title.length < 5 || title === "") {
    return res.status(400).json({ error: "title is to short." });
  }

  try {
    const updatecategory = await categoryModel.findByIdAndUpdate(categoryId, {
      postId: postId,
      userId: loginId,
      title: title,
    });
    await updatecategory.save();
    return res
      .status(200)
      .json({ message: "category update", categoryInfo: updatecategory });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.deletecategory = async (req, res, next) => {
  let deleteId = req.params.id;
  let loginId = req.user._id;
  try {
    const category = await categoryModel.findByIdAndDelete(deleteId);
    if (!category) {
      return res
        .status(400)
        .json({ error: "category not found. OR category already deleted." });
    }
    return res.status(200).json({ message: "category deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
