const express = require("express");
const bodyParser = require("body-parser");
const { config, corsOption } = require("../config/config.js");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const { notFound404, errorHandler } = require("../middleware/errors.js");
const database = require("../config/database.js");
const app = express();

console.log("Node Server-> ", config.NODE_ENVIROMENT);
database();
//create access logs file in node js
let accessLogFile = fs.createWriteStream(
  path.join(__dirname, "..", "/logs", "accessLog.log"),
  { flags: "a" }
);

morgan.token("ist", (req, res, tz) => {
  const now = new Date().toLocaleString("en-US", { timeZone: tz });
  return now + " IST";
});
app.use(cors(corsOption));
app.use(helmet());
app.use(bodyParser.json({ limit: "10mb" }));

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 100000,
  })
);

//wriet log file
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms [:ist[Asia/Kolkata]]",
    { stream: accessLogFile }
  )
);

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms [:ist[Asia/Kolkata]]"
  )
);
app.use((req, res, next) => {
  res.removeHeader("X-powered-by", false);
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.get("/", (req, res, next) => {
  return res.status(200).send("Hello world");
});

//routes defined here.
app.use("/api/v1/user", require("../router/user.routes.js"));
app.use("/api/v1/post", require("../router/post.routes.js"));
app.use("/api/v1/comment", require("../router/comment.routes.js"));
app.use("/api/v1/category", require("../router/category.routes.js"));
//not found error Handler
app.use(notFound404);
//errorHandler
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log("listening on port " + config.PORT);
});
