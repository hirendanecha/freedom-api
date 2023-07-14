"use strict";
const jwt = require("jsonwebtoken");
var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var User = function (user) {
  this.UserName = user.UserName;
  this.Password = user.Password;
  this.IsActive = user.IsActive || "N";
  this.DateCreation = user.DateCreation || new Date();
  this.IsAdmin = user.IsAdmin || "N";
  this.PartnerId = user.PartnerId;
  this.IsSuspended = user.IsSuspended;
  this.FirstName = user.FirstName;
  this.LastName = user.LastName;
  this.Address = user.Address;
  this.Country = user.Country;
  this.ZipCode = user.ZipCode;
  this.State = user.State;
  this.City = user.City;
  this.Place = user.Place;
};

User.login = function (username, Id, result) {
  console.log("User Name = " + username);
  db.query(
    `SELECT Id,
            UserName,
            IsActive,
            DateCreation,
            IsAdmin,
            FirstName,
            LastName,
            Address,
            Country,
            City,
            State,
            Place,
            ZipCode
     FROM users WHERE UserName = ? AND Id = ?`,
    [username, Id],
    async function (err, res) {
      if (err) {
        console.log("error login", err);
        return result(err, null);
      } else {
        const user = res[0];
        console.log(user);

        if (user?.IsActive === "N") {
          return result(
            {
              message:
                "Please check your email and click the activation link to activate your account.",
              errorCode: "not_verified",
            },
            null
          );
        }

        if (!user) {
          return result(
            {
              message: "Invalid Username and Password. Kindly try again !!!!",
              errorCode: "bad_credentials",
            },
            null
          );
        } else {
          console.log("Login Data");
          console.log(user);
          const token = await generateJwtToken(res[0]);
          return result(null, {
            userId: user.Id,
            user: user,
            accessToken: token,
          });
        }
      }
    }
  );
};

User.create = function (userData, result) {
  db.query("INSERT INTO users set ?", userData, function (err, res) {
    if (err) {
      console.log("error", err);
      result(err, null);
    } else {
      console.log(res.insertId);
      result(null, res.insertId);
    }
  });
};

User.findAll = function (result) {
  db.query("SELECT * from users order by userName", function (err, res) {
    if (err) {
      console.log("error", err);
      result(err, null);
    } else {
      console.log("user: ", res);
      result(null, res);
    }
  });
};

User.findById = function (user_id, result) {
  db.query("SELECT * from users WHERE Id = ? ", user_id, function (err, res) {
    if (err) {
      console.log("error", err);
      result(err, null);
    } else {
      console.log("user: ", res);
      result(null, res);
    }
  });
};

User.findByEmail = async function (userName) {
  const query = `SELECT * from users WHERE UserName = ?`;
  const values = [userName];
  const user = await executeQuery(query, values);
  return user[0];
};

User.update = function (user_id, user, result) {
  db.query(
    "UPDATE users SET ? WHERE Id=?",
    [user, user_id],
    function (err, res) {
      if (err) {
        console.log("error", err);
        result(err, null);
      } else {
        console.log("update: ", res);
        result(null, res);
      }
    }
  );
};

User.delete = function (user_id, result) {
  db.query("DELETE FROM users WHERE Id = ?", [user_id], function (err, res) {
    if (err) {
      console.log("error", err);
      result(err, null);
    } else {
      console.log("user deleted", res);
      result(null, res);
    }
  });
};

// ------------------- Zip Data ------------------

User.getZipData = function (zip, country, result) {
  let query =
    "SELECT country_code, state, city, place, country from zip_us WHERE zip=? ";
  if (country) {
    query = query + "AND country_code = ?";
  }
  query = query + "order by place";
  db.query(query, [zip, country], function (err, res) {
    if (err) {
      console.log("error", err);
      result(err, null);
    } else {
      let response = {};
      var promises = res.map(function (el) {
        response.country_code = el.country_code;
        response.state = el.state;
        response.city = el.city;
        response.places =
          (response.places ? response.places + "," : "") + el.place;
        response.country = el.country;
        return response;
      });

      Promise.all(promises).then(function (items) {
        // items is 2D array
        items = [].concat.apply([], items); // flatten the array
        //do something with the finalized list of items here
        result(null, items);
      });
    }
  });
};

User.getZipCountries = function (result) {
  db.query(
    "select country_code, country from zip_us group by country_code, country order by country asc;",
    function (err, res) {
      if (err) {
        console.log("error", err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

User.verification = function (token, result) {
  jwt.verify(token, environment.JWT_SECRET_KEY, async function (err, decoded) {
    if (err) {
      const decodedToken = jwt.decode(token);
      return result(err, decodedToken);
    }
    try {
      const updateQuery = await executeQuery(
        "UPDATE users SET IsActive = ? WHERE Id = ?",
        ["Y", decoded.userId]
      );
      const fetchUser = await executeQuery("select * from users where Id = ?", [
        decoded.userId,
      ]);
      return result(null, fetchUser[0]);
    } catch (error) {
      return result(err, null);
    }
  });
};

User.resendVerification = async function (email, result) {
  try {
    const findUserByEmail = await executeQuery(
      `select * from users where UserName = ?`,
      [email]
    );
    if (!findUserByEmail?.length) {
      throw "User not found by the given username.";
    }
    return result(null, findUserByEmail[0]);
  } catch (error) {
    return result(error, null);
  }
};

User.search = async function (query) {
  const { type, searchField, searchText } = query;
  if (type) {
    if (searchField && searchText) {
      const query = `select *  from ${type}  WHERE ${searchField} LIKE ?`;
      const values = [`%${searchText}%`];
      const searchData = await executeQuery(query, values);
      return searchData;
    } else {
      const query = `select *  from ${type}`;
      const searchData = await executeQuery(query);
      return searchData;
    }
  } else {
    return { error: "error" };
  }
};

User.setPassword = async function (user_id, password, result) {
  const query = `UPDATE users SET password=? WHERE Id=?`;
  const values = [password, user_id];
  const user = await executeQuery(query, values);
  return user;
};

module.exports = User;
