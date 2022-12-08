import { $fetch } from "ohmyfetch/node";

async function captchaCheck(token) {
  if (!token) {
    return false;
  }
  const response = await $fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SERVER_KEY}&response=${token}`
  );
  console.log("CaptchaCheck Result: ", response.success, response.score);
  return response.success && response.score >= process.env.CAPTCHA_SCORE;
}

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "https://localhost:3000"
    : "https://dev116.ru";

const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var cors = require("cors");
app.use(cors({ origin: [BASE_URL] }));

app.get("/users", async (req, res, next) => {
  var connection = require("../db/mysql.js");
  const [results] = await connection.execute("select * from users where 1");
  console.log("results:", results);
  //   var database = {};

  //   database.executeQuery = function (query, values, callback) {
  //     connection.query(query, values, function (err, rows, fields) {
  //       if (!err) {
  //         callback(null, rows, fields);
  //         res.send({ user: rows });
  //       } else {
  //         callback(err);
  //       }
  //     });

  // connection.query(
  //     "select * from users where 1",
  //     function (error, results, fields) {
  //         console.log("Error ->> ", error);
  //         console.log("Results ->> ", results);
  //         console.log("Fields ->> ", fields);

  //         res.send({ user: results });
  //     }
  // );
  //   };
});

export default {
  path: "/api/card",
  handler: app,
};
