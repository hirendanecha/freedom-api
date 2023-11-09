const jwt = require("jsonwebtoken");

module.exports = function () {
  this.generateJwtToken = (user) => {
    const payload = {
      user: {
        id: user.Id,
        username: user.Username,
        active: user.IsActive,
      },
    };

    return jwt.sign(payload, "MyS3cr3t", { expiresIn: "7d" });
  };
};
