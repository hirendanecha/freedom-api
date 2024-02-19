const jwt = require("jsonwebtoken");
const env = require("../environments/environment");

module.exports = function (req, res, next) {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized token" });
    }
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET_KEY);
      req.user = decoded.user;
      next();
    } catch (err) {
      res.status(401).json({ message: "not valid token" });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized token" });
  }
};
