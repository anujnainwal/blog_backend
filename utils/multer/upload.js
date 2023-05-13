const multer = require("multer");
const crypto = require("crypto");
const storage = multer.memoryStorage();
const path = require("path");
const sharp = require("sharp");
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  const maxSize = 1 * 1024 * 1024; // 1MB

  // Check if the file type is allowed
  if (allowedTypes.includes(file.mimetype)) {
    // Check if the file size is within the limit
    if (file.size >= maxSize) {
      cb({ message: "File size exceeds the limit of 1MB." }, false);
    } else {
      cb(null, true);
    }
  } else {
    cb({ message: "Only .jpeg, .jpg, .png, .gif are allowed." }, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB
  },
});

const profilePicResize = async (req, res, next) => {
  const profile = req.file;

  if (!req.file) {
    return res
      .status(400)
      .json({ status: 0, error: "Profile Pic is required." });
  }
  profile.filename = `user-${crypto.randomUUID()}-${profile.originalname}`;

  await sharp(profile.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(
      path.join(
        __dirname,
        "..",
        "..",
        `/public/images/profile/${profile.filename}`
      )
    );
  next();
};
const postImageResize = async (req, res, next) => {
  const post = req.file;

  if (!req.file) {
    return res
      .status(400)
      .json({ status: 0, error: "Profile Pic is required." });
  }

  const maxWidth = 1200; // Maximum width for the resized image
  const maxHeight = 1200; // Maximum height for the resized image
  const quality = 80; // JPEG compression quality (0-100)

  const fileExtension = post.originalname.split(".").pop();
  const randomFileName = `user-${crypto.randomUUID()}.${fileExtension}`;

  const resizedImagePath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "images",
    "post",
    randomFileName
  );

  try {
    await sharp(post.buffer)
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: quality })
      .toFile(resizedImagePath);

    post.filename = randomFileName;
    next();
  } catch (error) {
    // Handle any potential errors
    console.error("Error resizing image:", error);
    return res.status(500).json({ status: 0, error: "Image resizing failed." });
  }
};

module.exports = { upload, profilePicResize, postImageResize };
