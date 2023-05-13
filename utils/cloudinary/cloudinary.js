const cloudinary = require("cloudinary");
const { config } = require("../../config/config");

// Configuration
cloudinary.config({
  cloud_name: config.CLOUDINARY_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

const cloudinaryUploadImage = async (fileToUpload, folderName) => {
  try {
    const data = await cloudinary.v2.uploader.upload(fileToUpload, {
      folder: `${folderName}`,
    });
    return data;
  } catch (error) {
    return error;
  }
};

module.exports = { cloudinaryUploadImage };
