"use strict";
var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var Profile = function (profile) {
  this.UserName = profile.Username;
  this.FirstName = profile.FirstName;
  this.LastName = profile.LastName;
  this.Address = profile.Address;
  this.Country = profile.Country;
  this.City = profile.City;
  this.State = profile.State;
  this.Zip = profile.Zip;
  this.UserID = profile.Id || profile.UserID;
  this.DateofBirth = profile.DateofBirth;
  this.Gender = profile.Gender;
  this.MobileNo = profile.MobileNo;
  this.AccountType = profile.AccountType;
  this.Business_NP_TypeID = profile.Business_NP_TypeID || 0;
  this.CoverPicName = profile.CoverPicName;
  this.ProfilePicName = profile.ProfilePicName;
  this.IsActivated = profile.IsActive;
  this.CreatedOn = new Date();
  this.AccountType = "I";
};

Profile.create = function (profileData, result) {
  db.query("INSERT INTO profile set ?", profileData, function (err, res) {
    if (err) {
      console.log("error", err);
      result(err, null);
    } else {
      console.log(res.insertId);
      result(null, res.insertId);
    }
  });
};

Profile.FindById = function (profileId, result) {
  db.query(
    `SELECT ID,
            FirstName,  
            LastName,
            UserID,
            MobileNo,
            Gender,
            DateofBirth,
            Address,
            City,
            State,
            Zip,
            Country,
            Business_NP_TypeID,
            CoverPicName,
            IsActivated,
            Username,
            ProfilePicName,
            EmailVerified
            CreatedOn
    FROM profile WHERE ID=? `,
    profileId,
    function (err, res) {
      if (err) {
        console.log(err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

Profile.update = function (profileId, profileData, result) {
  db.query(
    "UPDATE profile SET ? WHERE ID=?",
    [profileData, profileId],
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

Profile.getUsersByUsername = async function (searchText) {
  if (searchText) {
    const query = `select p.ID as Id,p.Username,p.ProfilePicName from profile as p WHERE p.Username LIKE ? order by p.CreatedOn DESC limit 500`;
    const values = [`%${searchText}%`];
    const searchData = await executeQuery(query, values);
    return searchData;
  } else {
    return { error: "data not found" };
  }
};
module.exports = Profile;
