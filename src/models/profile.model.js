"use strict";
var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var Profile = function (profile) {
  this.UserName = profile.UserName;
  this.FirstName = profile.FirstName;
  this.LastName = profile.LastName;
  this.Address = profile.Place;
  this.Country = profile.Country;
  this.City = profile.City;
  this.State = profile.State;
  this.Zip = profile.ZipCode;
  this.UserID = profile.Id;
  this.DateofBirth = profile.DateofBirth;
  this.Gender = profile.Gender;
  this.MobileNo = profile.MobileNo;
  this.AccountType = profile.AccountType;
  this.Business_NP_TypeID = profile.Business_NP_TypeID || 0;
  this.CoverPicName = profile.CoverPicName;
  this.ProfilePicName = profile.ProfilePicName;
  this.IsActivated = profile.IsActive;
  this.CreatedOn = profile.CreatedOn || new Date();
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

module.exports = Profile;
