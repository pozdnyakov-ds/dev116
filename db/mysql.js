const mysql = require("mysql");

var connection = mysql.createConnection({
  host: "192.168.0.115:3306", //172.17.0.3
  user: "dimon",
  password: "123qweASD",
  database: "dev116",
  insecureAuth: true,
});

// connection.connect((err) => {
//   if (err) {
//     console.error("Error connection: ", err);
//   } else {
//     console.log("Успешное соединение с БД");
//   }
// });

module.exports = connection;
