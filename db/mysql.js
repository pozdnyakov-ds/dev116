const mysql = require("mysql2");

const pool = mysql.createPool({
  connectionLimit: 5,
  host: "2.59.42.74", //10.15.6.28
  port: "3306",
  user: "dimon",
  password: "123qweASD",
  database: "dev116",
  debug: false,
});

// Код для страницы:
// var pool = require("../db/mysql.js");

// pool.getConnection((err, connection) => {
//   if (err) throw err;
//   console.log("connected as id " + connection.threadId);
//   connection.query("SELECT * from users LIMIT 1", (err, rows) => {
//     connection.release(); // return the connection to pool
//     if (err) throw err;
//     console.log("The data from users table are: \n", rows);
//   });
// });

// pool.query("SELECT * FROM users", function (err, data) {
//   if (err) return console.log("Error: ", err);
//   res.send({
//     users: data,
//   });
// });

module.exports = pool;
