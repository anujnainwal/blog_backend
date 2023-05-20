require("dotenv").config();

exports.config = {
  NODE_ENVIROMENT: process.env.NODE_SERVER || "production",
  PORT: process.env.PORT || 8000,
  MONGO_URL: process.env.MONGO_URL,
  ACCESS_TOKEN: process.env.ACCESS_TOKEN,
  ACCESS_TOKEN_EXPIRE: process.env.ACCESS_TOKEN_EXPIRE,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN,
  REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE,
  USER_PASSWORD: process.env.NODEMAILER_PASSWORD,
  EMAIL_ADDRESS: process.env.NODEMAILER_USERNAME,
  ACTIVATION_EXPIRE: process.env.ACTIVATION_EXPIRE,
  MAIL_PORT: process.env.MAIL_PORT,
  SERVICE: process.env.SERVICE,
  HOST: process.env.HOST,
  RESET_EXPIRE: process.env.RESET_TOKEN_EXPIRE,
  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_ENVIROMENT: process.env.CLOUDINARY_ENVIROMENT,
};
const whiteList = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:7000",
  "https://blog-backend-xq2z.onrender.com",
  "https://blog-1999.netlify.app",
];
//cors options

exports.corsOption = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      return callback(null, true);
    } else {
      return callback("Not Allowed by cors.");
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
};
