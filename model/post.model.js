const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      minLength: 3,
      maxLength: 400,
      trim: true,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    isLiked: {
      type: Boolean,
      default: false,
    },
    isDisLiked: {
      type: Boolean,
      default: false,
    },
    numViews: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    description: {
      type: String,
      required: true,
    },
    blogImage: {
      type: String,
      default: "https://wmmedia.sgp1.cdn.digitaloceanspaces.com/blog.png",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

module.exports = mongoose.model("Posts", postSchema);
