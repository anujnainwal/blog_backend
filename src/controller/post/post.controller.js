const mongoose = require("mongoose");
const postModel = require("../../model/post.model");
const { createPostvalidation } = require("../../utils/validation/validation");
const fs = require("fs");
const path = require("path");
const userModel = require("../../model/user.model");
const uploadImageCloudinary = require("../../utils/cloudinary/cloudinary");
/*
    @route createPost api/v1/createPost
    @desc user create post
    @access private 
*/
exports.createPost = async (req, res, next) => {
  let loginId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(loginId)) {
    return res.status(400).json({ error: "Invalid Id" });
  }
  try {
    const { error, value } = createPostvalidation.validate(req.body, postModel);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const localPath = path.join(
      __dirname,
      "..",
      "..",
      `/public/images/post/${req.file.filename}`
    );
    const uploadImage = await uploadImageCloudinary.cloudinaryUploadImage(
      localPath,
      `post Images`
    );

    const post = await postModel.create({
      title: value.title,
      category: value.category,
      description: value.description,
      author: loginId,
      blogImage: uploadImage.url,
    });
    fs.unlinkSync(localPath);
    await post.save();

    return res.status(200).json({ message: "Post Created", postData: post });
  } catch (error) {
    return res.status(200).json({ error: error.message });
  }
};
/*
    @route fetchAll post api/v1/allPost
    @desc user fetch post
    @access get
*/
exports.fetchAllPost = async (req, res, next) => {
  try {
    const post = await postModel.find().populate("author");
    if (post?.length < 0) {
      return res.status(400).json({ error: "Not post found." });
    }
    return res
      .status(200)
      .json({ status: 1, message: "All post fetched.", postData: post });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route singlePost post api/v1/post/:id
    @desc user fetch post
    @access get
*/
exports.singlePost = async (req, res, next) => {
  const { id } = req.params;
  try {
    const singlePost = await postModel
      .findByIdAndUpdate(
        id,
        {
          $inc: {
            numViews: 1,
          },
        },
        {
          new: true,
        }
      )
      .populate("author");
    if (!singlePost) {
      return res.status(400).json({ error: "No User found." });
    }
    return res.status(200).json({
      status: 1,
      message: "Single Post Fetch successfully.",
      postInfo: singlePost,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route update post api/v1/post/:id
    @desc update Post
    @access private
*/
exports.updatePost = async (req, res, next) => {
  const loginId = req.user._id;
  const postId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(loginId)) {
    return res.status(400).json({ error: "Invalid loginId" });
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ error: "Invalid postId" });
  }

  try {
    const existingPost = await postModel.findOne({ _id: postId });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.author.toString() !== loginId.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this post" });
    }

    const updatedPost = await postModel.findOneAndUpdate(
      { _id: postId },
      { $set: req.body },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(500).json({ error: "Failed to update post" });
    }

    return res.status(200).json({
      status: 1,
      message: "Post updated successfully",
      updatedPost,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route delete post api/v1/delete/:id
    @desc delete post
    @access private
*/
exports.deletePost = async (req, res, next) => {
  const loginId = req.user._id;
  const postId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(loginId)) {
    return res.status(400).json({ error: "Invalid loginId" });
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ error: "Invalid postId" });
  }

  try {
    const existingPost = await postModel.findOne({ _id: postId });

    if (!existingPost) {
      return res
        .status(404)
        .json({ error: "Post not found or Post Already Deleted." });
    }

    if (existingPost.author.toString() !== loginId.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this post" });
    }

    const deletePost = await postModel.findByIdAndDelete(postId);

    if (!deletePost) {
      return res
        .status(500)
        .json({ error: "Post not Found or Post Already Deleted." });
    }

    return res.status(200).json({
      status: 1,
      message: "Post deleted successfully",
      deletePost,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route like post api/v1/post/like
    @desc like post
    @access private
*/
exports.userLike = async (req, res, next) => {
  // 1: Find the login User
  let loginId = req.user._id;

  // 2: Find the post
  let { postId } = req.body;
  //check post id is valid or not
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ error: "Invalid post Id." });
  }
  try {
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }
    //3: Find the user like the post ;
    const isLiked = post?.isLiked;
    //4: Find the user dislike the post;
    const alreadyDisLike = post?.dislikes.find(
      (userId) => userId?.toString() === loginId?.toString()
    );
    if (alreadyDisLike) {
      const post = await postModel.findByIdAndUpdate(
        postId,
        {
          $pull: {
            dislikes: loginId,
          },
          isDisLiked: false,
        },
        {
          new: true,
        }
      );
      return res
        .status(200)
        .json({ message: "Remove dislike the post.", post });
    }
    //check user already liked then remove
    if (isLiked) {
      const post = await postModel.findByIdAndUpdate(
        postId,
        {
          $pull: {
            likes: loginId,
          },
          isLiked: false,
        },
        {
          new: true,
        }
      );
      return res.status(200).json({ message: "Remove like the post.", post });
    } else {
      const post = await postModel.findByIdAndUpdate(
        postId,
        {
          $push: {
            likes: loginId,
          },
          isLiked: true,
        },
        {
          new: true,
        }
      );
      return res
        .status(200)
        .json({ status: 1, message: "Liked post successfull", post });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*
    @route disLike post api/v1/post/dislike
    @desc disLike post api/v1/post/dislike
    @access private
*/
exports.userDislike = async (req, res, next) => {
  // 1: Find the login User
  let loginId = req.user._id;

  // 2: Find the post
  let { postId } = req.body;
  //check post id is valid or not
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ error: "Invalid post Id." });
  }
  try {
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }
    //3: Find the user like the post ;
    const alreadyLike = post?.likes.find(
      (userId) => userId?.toString() === loginId?.toString()
    );
    //4: Find the user dislike the post;
    const alreadyDisLike = post?.isDisLiked;
    if (alreadyLike) {
      const post = await postModel.findByIdAndUpdate(
        postId,
        {
          $pull: {
            likes: loginId,
          },
          isLiked: false,
        },
        {
          new: true,
        }
      );
      return res
        .status(200)
        .json({ message: "Remove dislike the post.", post });
    }
    //check user already liked then remove
    if (alreadyDisLike) {
      const post = await postModel.findByIdAndUpdate(
        postId,
        {
          $pull: {
            dislikes: loginId,
          },
          isDisLiked: false,
        },
        {
          new: true,
        }
      );
      return res
        .status(200)
        .json({ message: "Remove dislike the post.", post });
    } else {
      const post = await postModel.findByIdAndUpdate(
        postId,
        {
          $push: {
            dislikes: loginId,
          },
          isDisLiked: true,
        },
        {
          new: true,
        }
      );
      return res
        .status(200)
        .json({ status: 1, message: " post Dislike successfull", post });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
