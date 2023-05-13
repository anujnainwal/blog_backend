const jwt = require("jsonwebtoken");
const { config } = require("../config/config");

const accessToken = async (user) => {
  return await jwt.sign({ _id: user._id }, config.ACCESS_TOKEN, {
    expiresIn: config.ACCESS_TOKEN_EXPIRE,
  });
};

module.exports = { accessToken };
