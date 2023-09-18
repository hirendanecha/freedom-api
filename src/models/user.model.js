"use strict";
const jwt = require("jsonwebtoken");
var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var User = function (user) {
  this.Email = user.Email;
  this.Username = user.Username;
  this.Password = user.Password;
  this.IsActive = user.IsActive || "N";
  this.DateCreation = new Date();
  this.IsAdmin = user.IsAdmin || "N";
  this.PartnerId = user.PartnerId;
  this.IsSuspended = user.IsSuspended || "N";
  this.FirstName = user.FirstName;
  this.LastName = user.LastName;
  this.Address = user.Address;
  this.Country = user.Country;
  this.Zip = user.Zip;
  this.State = user.State;
  this.City = user.City;
};

User.login = function (email, Id, result) {
  db.query(
    `SELECT u.Id,
            u.Email,
            u.Username,
            u.IsActive,
            u.DateCreation,
            u.IsAdmin,
            u.FirstName,
            u.LastName,
            u.Address,
            u.Country,
            u.City,
            u.State,
            u.Zip,
            u.AccountType,
            p.ID as profileId,
            cm.communityId
     FROM users as u left join profile as p on p.UserID = u.Id left join communityMembers as cm on cm.profileId = p.ID WHERE u.Email = ? OR u.Username = ? AND u.Id = ?`,
    [email, email, Id],
    async function (err, res) {
      if (err) {
        console.log("error login", err);
        return result(err, null);
      } else {
        const user = res[0];
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
        if (user.IsSuspended === "N") {
          return result(
            {
              message: "This user has been suspended by admin",
              errorCode: "not_verified",
            },
            null
          );
        }

        if (!user) {
          return result(
            {
              message: "Invalid Email and Password. Kindly try again !!!!",
              errorCode: "bad_credentials",
            },
            null
          );
        } else {
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

User.findAndSearchAll = async (limit, offset, search) => {
  const whereCondition = `u.IsAdmin != 'Y' ${
    search ? `AND Email LIKE '%${search}%'` : ""
  }`;
  const searchCount = await executeQuery(
    `SELECT count(Id) as count FROM users as u WHERE ${whereCondition}`
  );
  console.log(searchCount);
  const searchData = await executeQuery(
    `SELECT u.Id, u.Email, u.Username, u.IsActive, u.DateCreation, u.IsAdmin, u.FirstName, u.LastName, u.Address, u.Country, u.City, u.State, u.Zip, u.AccountType, u.IsSuspended,p.MobileNo,p.ProfilePicName,p.ID as profileId,p.MediaApproved FROM users as u left join profile as p on p.UserID = u.Id  WHERE ${whereCondition} order by DateCreation desc limit ? offset ?`,
    [limit, offset]
  );

  return {
    count: searchCount?.[0]?.count || 0,
    data: searchData,
  };
};

User.findById = async function (user_id) {
  const query = `SELECT u.Id,
  u.Email,
  u.IsActive,
  u.DateCreation,
  u.IsAdmin,
  u.FirstName,
  u.LastName,
  u.Address,
  u.Country,
  u.City,
  u.State,
  u.Zip,
  u.Username,
  u.AccountType,
  u.IsSuspended,
  p.ID as profileId
FROM users as u left join profile as p on p.UserID = u.Id WHERE u.Id = ? `;
  const values = [user_id];
  const user = await executeQuery(query, values);
  return user;
};

User.findByUsernameAndEmail = async function (email) {
  const query = `SELECT * from users WHERE Email = ? or Username = ?`;
  const values = [email, email];
  const user = await executeQuery(query, values);
  console.log(user);
  return user[0];
};

User.findByEmail = async function (email) {
  console.log(email);
  const query = `SELECT Username from users WHERE Email = ?`;
  const values = [email];
  const user = await executeQuery(query, values);
  return user[0];
};

User.findByUsername = async function (username) {
  const query = `SELECT Username from users WHERE Username = ?`;
  const values = [username];
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

User.delete = async function (user_id) {
  const query = "DELETE FROM users WHERE Id = ?";
  const query1 = "DELETE FROM profile WHERE UserID = ?";
  const values = [user_id];
  const user = await executeQuery(query, values);
  const users = await executeQuery(query1, values);
  return true;
  // db.query("DELETE FROM users WHERE Id = ?", [user_id], function (err, res) {
  //   if (err) {
  //     console.log("error", err);
  //     result(err, null);
  //   } else {
  //     console.log("user deleted", res);
  //     result(null, res);
  //   }
  // });
};

User.changeAccountType = function (userId, type, result) {
  db.query(
    "UPDATE users SET AccountType = ? WHERE Id=?",
    [type, userId],
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

User.adminLogin = function (email, result) {
  db.query(
    `SELECT Id,
            Email,
            Username,
            IsActive,
            DateCreation,
            IsAdmin,
            FirstName,
            LastName,
            Address,
            Country,
            City,
            State,
            Zip,
            AccountType
     FROM users WHERE Email = ?`,
    email,
    async function (err, res) {
      if (err) {
        console.log("error login", err);
        return result(err, null);
      } else {
        const user = res[0];
        // console.log(user);

        if (user?.IsAdmin === "N") {
          return result(
            {
              message: "Invalid Email and Password. Kindly try again !!!!",
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

User.changeStatus = function (userId, status, result) {
  db.query(
    "UPDATE users SET IsActive = ? WHERE Id= ?",
    [status, userId],
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

User.suspendUser = function (userId, status, result) {
  db.query(
    "UPDATE users SET IsSuspended = ? WHERE Id= ?",
    [status, userId],
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

User.activateMedia = function (profileId, status, result) {
  db.query(
    "UPDATE profile SET MediaApproved = ? WHERE ID= ?",
    [status, profileId],
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

User.getAll = async function () {
  const query = `SELECT 
          p.ID,
          p.Username,
          p.FirstName
   from users as u left join profile as p on p.UserID = u.Id where u.IsActive='Y' AND u.IsAdmin != 'Y' AND u.IsSuspended !='Y' AND p.Username is not NULL order by p.CreatedOn desc limit 500`;
  const values = [];
  const user = await executeQuery(query, values);
  console.log("users===>", user);
  return user;
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
        // response.places =
        //   (response.places ? response.places + "," : "") + el.place;
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
        "UPDATE users SET IsActive ='Y' WHERE Id = ?",
        [decoded.userId]
      );
      const fetchUser = await executeQuery("select * from users where Id = ?", [
        decoded.userId,
      ]);
      console.log("fetchUser", updateQuery, fetchUser);
      return result(null, fetchUser[0]);
    } catch (error) {
      console.log(error);
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

User.setPassword = async function (user_id, password) {
  const query = `UPDATE users SET password=? WHERE Id=?`;
  const values = [password, user_id];
  const user = await executeQuery(query, values);
  return user;
};

module.exports = User;
