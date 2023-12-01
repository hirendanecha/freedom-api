"use strict";

const mysql = require("mysql2");

const db = mysql.createConnection({
  // host: "127.0.0.1",
  // user: "root",
  // password: "",
  // database: "freedom-live",
 // host: '65.108.254.22',
  host: '135.181.104.107',
  user: 'root',
  password: 'JYq1Nyr2l7Cf',
  database: 'freedom-buzz'
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Database connected");
});

function keepAlive() {
  db.query("SELECT 1", (err) => {
    if (err) throw err;
  });
}
setInterval(keepAlive, 30000);

module.exports = db;
