const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "https://localhost:3000"
    : "https://dev116.ru";

console.log("MODE: ", process.env.NODE_ENV);

const express = require("express");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var cors = require("cors");
app.use(cors({ origin: [BASE_URL] }));

app.get("/", function (req, res, next) {
  res.send({ error: "Please select controller/method..." });
});

export default {
  path: "/api",
  handler: app,
};
