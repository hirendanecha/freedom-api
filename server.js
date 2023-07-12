const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");

const https = require("https"),
  fs = require("fs"),
  helmet = require("helmet");

const app = express();

var originsWhitelist = [
  "https://www.localfoods.market/",
  "https://www.localfoods.market",
  "https://localfoods.market/",
  "https://localfoods.market",
];
var corsOptions = {
  origin: function (origin, callback) {
    var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
    callback(null, isWhitelisted);
  },
  credentials: true,
  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS"],
};
// app.use(cors(corsOptions));
app.use(cors());

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
const authRoutes = require("./src/routes/user.routes");
const utilsRoutes = require("./src/routes/utils.routes");
const postRoutes = require("./src/routes/post.routes");
const adminRouter = require("./src/routes/admin.routes");
app.use("/uploads", express.static(__dirname + "/uploads"));

app.get("/", (req, res) => {
  res.writeHead(200);
  res.send("LFM API Server");
});

try {
  // Initiate the API //
  app.use("/api/v1/login", authRoutes);
  app.use("/api/v1/customers", authRoutes);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/utils", utilsRoutes);
  app.use("/api/v1/posts", postRoutes);
} catch (e) {
  console.log(e);
}

const port = process.env.PORT || 5000;

app.listen(port, "127.0.0.1", function () {
  console.log(`Server listening on port ${port}`);
});

/*const sport = process.env.PORT || 5050;

https.createServer(app).listen(sport, function () {
  console.log(`Https Server listening on port ${sport}`);
});
*/
