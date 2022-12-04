const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "https://localhost:3000"
    : "https://dev116.ru";

const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var fs = require("fs");

// SETUP MULTER
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "static/avatars");
  },
  filename: function (req, file, cb) {
    var file_exp = file.mimetype.split("/")[1];
    cb(null, "avatar-" + Date.now() + "." + file_exp);
  },
});
const userUpload = multer({ storage: storage });

var cors = require("cors");
app.use(cors({ origin: [BASE_URL] }));

// GET USER BY TOKEN
app.get("/auth", function (req, res, next) {
  const r = req.headers.authorization || "";
  const token = r.split(" ")[1] || null;
  console.log("AUTH TOKEN: ", token);

  var jwt = require("jsonwebtoken");
  try {
    var decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    //console.log("decodedData: ", decodedData);
  } catch (e) {
    console.log("Token verify error: ", e.response.data);
    this.$store.commit("logout");
  }

  const sqlite3 = require("sqlite3").verbose();

  let db = new sqlite3.Database(
    `./db/${process.env.DATABASE}.db`,
    sqlite3.OPEN_READONLY,
    (e) => {
      if (e) {
        //console.error(`Ошибка соединения с БД`, e.message);
      }

      db.get(
        "SELECT id, name, surname, email, password, photo, scope, token, refresh_token, status FROM users WHERE token=?",
        [token],
        function (err, row) {
          if (err) {
            //...
            return;
          } else {
            res.status(200).send({ user: row });
          }
        }
      );
    }
  );
});

// GET USERS LIST
app.get("/list", function (req, res, next) {
  const token = req.query.token || null;
  var users = [];

  const sqlite3 = require("sqlite3").verbose();
  let db = new sqlite3.Database(
    `./db/${process.env.DATABASE}.db`,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (e) => {
      if (e) {
        //console.error("Database error: ", e.message);
      }

      db.all(
        `SELECT id, name, surname, email, password, photo, scope, token, refresh_token, status 
        FROM users
        WHERE (SELECT scope FROM users WHERE token=?) LIKE '%admin%'`,
        [token],
        function (e, rows) {
          if (e) {
            console.error("Users list error: ", e);
            return;
          } else {
            rows.forEach((row) => {
              users.push(row);
            });
            res.send({ users });
          }
        }
      );
    }
  );
});

// UPDATE USER CAB
app.post("/cab", (req, res, next) => {
  const user = { ...req.body };

  var data = {
    error: 0,
    message: "",
    avatar: null,
  };

  const sqlite3 = require("sqlite3").verbose();
  if (user && user.token) {
    let db = new sqlite3.Database(
      `./db/${process.env.DATABASE}.db`,
      sqlite3.OPEN_READWRITE,
      (e) => {
        if (e) {
          data.error = 1;
          data.message = `Ошибка соединения с БД` + e.message;
          return res.status(200).send(data);
        } else {
          db.run(
            "UPDATE users SET name=?, surname=?, password=? WHERE token=?",
            [user.name, user.surname, user.password, user.token],
            (err) => {
              if (err) {
                data.error = 1;
                data.message = "Ошибка обновления карточки пользователя";
                return res.status(200).send(data);
              } else {
                data.error = 0;
                data.message = "Обновление карточки пользователя";
                return res.status(200).send(data);
              }
            }
          );
        }
      }
    );
  } else {
    data.error = 1;
    data.message = "Ошибка обновления карточки пользователя";
    return res.status(200).send(data);
  }
});

// UPDATE USER BY TOKEN
app.post("/upload", userUpload.any(), (req, res, next) => {
  const user = { ...req.body };

  var avatar =
    req.files && req.files[0] && req.files[0].filename
      ? req.files[0].filename
      : null;

  var data = {
    error: 0,
    message: "",
    avatar: null,
  };

  const sqlite3 = require("sqlite3").verbose();
  if (user && user.token && avatar) {
    let db = new sqlite3.Database(
      `./db/${process.env.DATABASE}.db`,
      sqlite3.OPEN_READWRITE,
      (e) => {
        if (e) {
          data.error = 1;
          data.message = `Ошибка соединения с БД` + e.message;
          return res.status(200).send(data);
        } else {
          db.run(
            "UPDATE users SET photo=? WHERE token=?",
            [avatar, user.token],
            (err) => {
              if (err) {
                data.error = 1;
                data.message = "Ошибка обновления фото пользователя";
                return res.status(200).send(data);
              } else {
                data.error = 0;
                data.message = "Успешное обновление фото пользователя";
                data.avatar = avatar;

                // Delete the file like normal
                //console.log("Ищем файл: ", 'static/avatars/' + user.savedPhoto);
                try {
                  if (fs.existsSync("static/avatars/" + user.savedPhoto)) {
                    // console.log(
                    //   "Удаляем файл: ",
                    //   "static/avatars/" + user.savedPhoto
                    // );
                  }
                  fs.rmSync("static/avatars/" + user.savedPhoto, {
                    force: true,
                  });
                } catch (e) {
                  console.log("Ошибка удаления файла: ", e);
                }
                return res.status(200).send(data);
              }
            }
          );
        }
      }
    );
  } else {
    data.error = 1;
    data.message = "Ошибка обновления фото пользователя";
    return res.status(200).send(data);
  }
});

app.post("/status", (req, res, next) => {
  var data = {
    error: 0,
    message: "",
    avatar: null,
  };

  const adminToken = req.body.token || null;
  const u = req.body.user || null;
  const id = u && u.id ? u.id : null;
  const status = u && u.status ? 1 : 0;

  const sqlite3 = require("sqlite3").verbose();
  if (id && adminToken) {
    let db = new sqlite3.Database(
      `./db/${process.env.DATABASE}.db`,
      sqlite3.OPEN_READWRITE,
      (e) => {
        if (e) {
          data.error = 1;
          data.message = "Ошибка соединения";
          return res.status(200).send(data);
        } else {
          db.run(
            `UPDATE users SET status=? WHERE id=? AND 
            (SELECT scope FROM users WHERE token=?) LIKE '%admin%'`,
            [status, id, adminToken],
            (e) => {
              if (e) {
                data.error = 1;
                data.message = "Ошибка смены статуса";
                return res.status(200).send(data);
              } else {
                data.error = 0;
                data.message = "Успешная смена статуса";
                return res.status(200).send(data);
              }
            }
          );
        }
      }
    );
  } else {
    data.error = 1;
    data.message = "Ошибка смены статуса";
    return res.status(200).send(data);
  }
});

export default {
  path: "/api/users",
  handler: app,
};
