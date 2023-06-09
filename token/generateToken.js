const jwt = require("jsonwebtoken");
const { config } = require("../config/config");
const crypto = require("crypto");
const TokenModel = require("../model/token.model");
const accessToken = async (user) => {
  return await jwt.sign(
    { _id: user._id,  },
    config.ACCESS_TOKEN,
    {
      expiresIn: config.ACCESS_TOKEN_EXPIRE,
    }
  );
};
const refreshToken = async (user) => {
  let refreshToken = crypto.randomUUID();
  let token = new TokenModel({
    userId: user._id,
    refreshToken: refreshToken,
    expireAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
  });
  await token.save();
  return refreshToken;
};
module.exports = { accessToken, refreshToken };
