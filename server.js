const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
var indexRouter = require("./src/routes");

const https = require("https"),
  fs = require("fs"),
  helmet = require("helmet");

const app = express();

var originsWhitelist = [
  "https://dev.freedom.opash.in/",
  "https://www.dev.freedom.opash.in/",
  "http://localhost:4200/",
];
var corsOptions = {
  origin: function (origin, callback) {
    var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
    callback(null, isWhitelisted);
  },
  credentials: true,
  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS"],
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
); // Add Helmet as a middleware

app.use(morgan("tiny"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.options("*", cors(corsOptions));

// All routes for the APIs //

app.use("/uploads", express.static(__dirname + "/uploads"));

app.get("/", (req, res) => {
  res.writeHead(200);
  res.send("LFM API Server");
});

try {
  // Initiate the API //
  app.use("/api/v1/", indexRouter);
} catch (e) {
  console.log(e);
}

const port = process.env.PORT;

app.listen(port, "127.0.0.1", function () {
  console.log(`Server listening on port ${port}`);
});

/*const sport = process.env.PORT || 5050;

https.createServer(app).listen(sport, function () {
  console.log(`Https Server listening on port ${sport}`);
});
*/
