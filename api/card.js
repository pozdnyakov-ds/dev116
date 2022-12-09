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
  var pool = require("../db/mysql.js");

  pool.query("SELECT * FROM okved", function(err, data) {
    if(err) return console.log("Error: ", err);
    res.send({
        users: data
    });
  });

});

export default {
  path: "/api/card",
  handler: app,
};
