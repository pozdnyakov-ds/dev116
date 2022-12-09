const mysql = require("mysql2");

const pool = mysql.createPool({
  connectionLimit: 5,
  host: "10.15.6.28",
  port: "3306",
  user: "dimon",
  password: "123qweASD",
  database: "sakhalin"
});

module.exports = pool;
