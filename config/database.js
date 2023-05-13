const mongoose = require("mongoose");
const { config } = require("./config");

const database = () => {
  mongoose
    .connect(config.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((response) => {
      console.log("MongoDB Connection PORT: ", response.connection.host);
    })
    .catch((error) => {
      console.log("Error in DB connection: " + error);
    });
};
mongoose.connection.on("connected", () => {
  console.log(`MongoDb Connection: Connected .`);
});
mongoose.connection.on("error", () => {
  console.log("Error in connection");
});
process.on("SIGINT", () => {
  console.log("MongoDB connection: Disconnected.");
});

module.exports = database;
