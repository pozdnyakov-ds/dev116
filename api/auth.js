import { $fetch } from "ohmyfetch";

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

app.post("/login", async (req, res, next) => {
  const sqlite3 = require("sqlite3").verbose();

  var email = req.body.email;
  var password = req.body.password;
  var captchaToken = req.body.captcha_token || null;
  var token = null;
  var refreshToken = null;

  var data = {
    error: 0,
    message: "",
    token: null,
    refreshToken: null,
    scope: null,
  };

  // CHECK GOOGLE CAPTCHA by captchaToken
  if (!captchaCheck(captchaToken)) {
    data.error = 1;
    data.message = "Captcha error";
    res.send(data);
  }

  var db = new sqlite3.Database(
    `./db/${process.env.DATABASE}.db`,
    sqlite3.OPEN_READWRITE,
    (e) => {
      if (e) {
        data.error = 1;
        data.message = `Ошибка соединения с БД: ./db/${process.env.DATABASE}.db`;
        res.send(data);
        return;
      } else {
        db.get(
          "SELECT id, scope FROM users WHERE email=? AND password=? AND status=1",
          [email, password],
          function (err, row) {
            if (err) {
              data.error = 1;
              data.message = "Ошибка логина";
              res.send(data);
              return;
            } else {
              if (row && row.id) {
                data.scope = row.scope;

                var jwt = require("jsonwebtoken");
                token = jwt.sign(
                  { id: row.id, email: email, scope: data.scope },
                  process.env.TOKEN_SECRET,
                  {
                    expiresIn: "30m",
                  }
                );
                refreshToken = jwt.sign(
                  { id: row.id, email: email, scope: data.scope },
                  process.env.REFRESH_TOKEN_SECRET,
                  {
                    expiresIn: "30d",
                  }
                );

                db.run(
                  "UPDATE users SET token=$token, refresh_token=$refresh_token WHERE email=$email AND password=$password",
                  {
                    $token: token,
                    $refresh_token: refreshToken,
                    $email: email,
                    $password: password,
                  },
                  function (e, result) {
                    if (e) {
                      data.error = 1;
                      data.message = "Ошибка записи токена пользователя!";
                      console.log("Ошибка записи токена пользователя: ", e);
                      db.close();
                      res.send(data);
                      return;
                    } else {
                      data.error = 0;
                      data.message = "Успешный логин";
                      data.token = token;
                      data.refreshToken = refreshToken;
                      res.send(data);
                      db.close();
                      return;
                    }
                  }
                );
              } else {
                data.error = 1;
                data.message =
                  "Нет такого пользователя и/или пароля. Возможно, вы не подтвердили свой Email адрес.";
                res.send(data);
                return;
              }
            }
          }
        );
      }
    }
  );
});

app.post("/register", async (req, res, next) => {
  const sqlite3 = require("sqlite3").verbose();

  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    auth: {
      user: process.env.MAIL_AUTH_USER,
      pass: process.env.MAIL_AUTH_PASS,
    },
  });

  var name = req.body.name;
  var email = req.body.email;
  var uniqueEmail = true;
  var password = req.body.password;
  var captchaToken = req.body.captcha_token || null;
  var id = Math.random().toString(32).slice(2);
  var data = {
    error: 0,
    message: "",
  };

  // CHECK GOOGLE CAPTCHA by captchaToken
  if (!captchaCheck(captchaToken)) {
    data.error = 1;
    data.message = "Captcha error";
    res.send(data);
  }

  var jwt = require("jsonwebtoken");
  var emailToken = jwt.sign(
    { id: id, email: email },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  var db = new sqlite3.Database(
    `./db/${process.env.DATABASE}.db`,
    sqlite3.OPEN_READWRITE,
    (e) => {
      if (e) {
        data.error = 1;
        data.message = "Ошибка соединения";
        res.send(data);
        return;
      } else {
        db.all(
          "SELECT email FROM users WHERE email=?",
          [email],
          function (err, rows) {
            if (err) {
              data.error = 1;
              data.message = "Ошибка проверка email";
              res.send(data);
              return;
            } else {
              rows.forEach(function (row) {
                if (row.email == email) uniqueEmail = false;
                else uniqueEmail = true;
              });

              if (uniqueEmail) {
                db.run(
                  "INSERT INTO users (id, name, email, password, email_token, scope) VALUES (?,?,?,?,?,?)",
                  [id, name, email, password, emailToken, "user"],
                  function (err, result) {
                    if (err) {
                      data.error = 1;
                      data.message = "Ошибка Insert";
                      res.send(data);
                      return;
                    } else {
                      var content = `<b>Ссылка для подтверждения регистрации (действительна 24 часа):</b>
                          <a target=_blank href="${BASE_URL}/api/auth/submit?email=${email}&token=${emailToken}">Подтвердить</a><br>`;

                      const info = transporter.sendMail(
                        {
                          from: `Dev116 <${process.env.MAIL_AUTH_USER}>`,
                          to: email,
                          subject:
                            "Подтверждение регистрации на проекте Dev116.ru",
                          text: ``,
                          html: content,
                          sender: process.env.MAIL_AUTH_USER,
                          replyTo: process.env.MAIL_AUTH_USER,
                          dkim: {
                            domainName: process.env.MAIL_DOMAIN_NAME,
                            keySelector: process.env.MAIL_KEY_SELECTOR,
                            privateKey: process.env.MAIL_PRIVATE_KEY,
                          },
                        },
                        function (error, info) {
                          var resp = false;
                          if (error) {
                            data.error = 1;
                            data.message = "Ошибка отправки Email";
                            res.send(data);
                            return;
                          } else {
                            data.error = 0;
                            data.message = "Email отправлен";
                            res.send(data);
                            return;
                          }
                        }
                      );
                    }
                  }
                );
              } else {
                data.error = 1;
                data.message = "Такой Email уже зарегистрирован";
                res.send(data);
                return;
              }
            }
          }
        );
      }
    }
  );
});

app.get("/refresh", async (req, res, next) => {
  const r = req.headers.authorization || "";
  const token = r.split(" ")[1] || null;

  var newToken = null;
  var newRefreshToken = null;
  var user = null;

  var jwt = require("jsonwebtoken");
  try {
    var decodedData =
      jwt.verify(token, process.env.REFRESH_TOKEN_SECRET) || null;
    //...
  } catch (e) {
    //...
  }

  var sqlite3 = require("sqlite3").verbose();
  var db = new sqlite3.Database(
    `./db/${process.env.DATABASE}.db`,
    sqlite3.OPEN_READONLY,
    (e) => {
      if (e) {
        console.error(`Ошибка соединения с БД`, e.message);
      }

      db.get(
        "SELECT id, name, surname, email, password, photo, scope, token, refresh_token, status FROM users WHERE refresh_token=?",
        [token],
        function (err, row) {
          if (err) {
            //...
            return;
          } else {
            user = row;
            if (!user) {
              return res.status(200).send({ user });
            }

            newToken = jwt.sign(
              { id: user.id, email: user.email, scope: user.scope },
              process.env.TOKEN_SECRET,
              {
                expiresIn: "1m",
              }
            );

            newRefreshToken = jwt.sign(
              { id: user.id, email: user.email, scope: user.scope },
              process.env.TOKEN_SECRET,
              {
                expiresIn: "60d",
              }
            );

            db.run(
              "UPDATE users SET token=$newToken, refresh_token=$newRefreshToken WHERE refresh_token=$token",
              {
                $newToken: newToken,
                $newRefreshToken: newRefreshToken,
                $token: token,
              },
              function (err, result) {
                if (err) {
                  db.close();
                  return res.status(200).send({ user });
                } else {
                  user.token = newToken;
                  user.refreshToken = newRefreshToken;
                  db.close();
                  return res.status(200).send({ user });
                }
              }
            );
          }
        }
      );
    }
  );
});

app.post("/forgot", async (req, res, next) => {
  const sqlite3 = require("sqlite3").verbose();

  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    auth: {
      user: process.env.MAIL_AUTH_USER,
      pass: process.env.MAIL_AUTH_PASS,
    },
  });

  var email = req.body.email;
  var captchaToken = req.body.captcha_token || null;
  var data = {
    error: 0,
    message: "",
  };

  // CHECK GOOGLE CAPTCHA by captchaToken
  if (!captchaCheck(captchaToken)) {
    data.error = 1;
    data.message = "Captcha error";
    res.send(data);
  }

  var jwt = require("jsonwebtoken");
  var emailToken = jwt.sign({ email: email }, process.env.TOKEN_SECRET, {
    expiresIn: "1d",
  });

  var db = new sqlite3.Database(
    `./db/${process.env.DATABASE}.db`,
    sqlite3.OPEN_READWRITE,
    (e) => {
      if (e) {
        data.error = 1;
        data.message = "Ошибка соединения";
        res.send(data);
        return;
      } else {
        db.run(
          "UPDATE users SET email_token=? WHERE email=?",
          [emailToken, email],
          function (err, result) {
            if (err) {
              data.error = 1;
              data.message = "Ошибка БД";
              res.send(data);
              return;
            } else {
              var content = `<b>Ссылка для сброса пароль:</b> <a target=_blank href="${BASE_URL}/reset?email=${email}&token=${emailToken}">Подтвердить</a><br>
                Если вы не отправляли этот запрос, то просто закройте и удалите это письмо.`;

              const info = transporter.sendMail(
                {
                  from: `Dev116 <${process.env.MAIL_AUTH_USER}>`,
                  to: email,
                  subject: "Подтверждение сброса пароля на проекте Dev116.ru",
                  text: ``,
                  html: content,
                  sender: process.env.MAIL_AUTH_USER,
                  replyTo: process.env.MAIL_AUTH_USER,
                  dkim: {
                    domainName: process.env.MAIL_DOMAIN_NAME,
                    keySelector: process.env.MAIL_KEY_SELECTOR,
                    privateKey: process.env.MAIL_PRIVATE_KEY,
                  },
                },
                function (error, info) {
                  var resp = false;
                  if (error) {
                    data.error = 1;
                    data.message = "Ошибка отправки Email";
                    res.send(data);
                    return;
                  } else {
                    data.error = 0;
                    data.message = "Email отправлен";
                    res.send(data);
                    return;
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

app.post("/reset", async (req, res, next) => {
  const sqlite3 = require("sqlite3").verbose();

  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    auth: {
      user: process.env.MAIL_AUTH_USER,
      pass: process.env.MAIL_AUTH_PASS,
    },
  });

  var email = req.body.email || "";
  var token = req.body.token || "";
  var password = req.body.password || "";
  var captchaToken = req.body.captcha_token || null;
  var data = {
    error: 0,
    message: "",
  };

  // CHECK GOOGLE CAPTCHA by captchaToken
  if (!captchaCheck(captchaToken)) {
    data.error = 1;
    data.message = "Captcha error";
    res.send(data);
  }

  var db = new sqlite3.Database(
    `./db/${process.env.DATABASE}.db`,
    sqlite3.OPEN_READWRITE,
    (e) => {
      if (e) {
        data.error = 1;
        data.message = "Ошибка соединения";
        res.send(data);
        return;
      } else {
        db.run(
          "UPDATE users SET password=?, email_token='' WHERE email=? AND email_token=?",
          [password, email, token],
          function (err, result) {
            if (err) {
              data.error = 1;
              data.message = "Ошибка БД";
              res.send(data);
              return;
            } else {
              var content = `Для учетной записи <b>${email}</b> пароль был успешно обновлен!</b>`;

              const info = transporter.sendMail(
                {
                  from: `Dev116 <${process.env.MAIL_AUTH_USER}>`,
                  to: email,
                  subject: "Подтверждение смены пароля на проекте Dev116.ru",
                  text: ``,
                  html: content,
                  sender: process.env.MAIL_AUTH_USER,
                  replyTo: process.env.MAIL_AUTH_USER,
                  dkim: {
                    domainName: process.env.MAIL_DOMAIN_NAME,
                    keySelector: process.env.MAIL_KEY_SELECTOR,
                    privateKey: process.env.MAIL_PRIVATE_KEY,
                  },
                },
                function (error, info) {
                  var resp = false;
                  if (error) {
                    data.error = 1;
                    data.message = "Ошибка отправки Email";
                    res.send(data);
                    return;
                  } else {
                    data.error = 0;
                    data.message = "Email отправлен";
                    res.send(data);
                    return;
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

app.get("/submit", async (req, res, next) => {
  const sqlite3 = require("sqlite3").verbose();

  var data = {
    error: 0,
    message: "",
    email: req.query.email || "",
    token: req.query.token || "",
  };

  var db = new sqlite3.Database(
    `./db/${process.env.DATABASE}.db`,
    sqlite3.OPEN_READWRITE,
    (e) => {
      if (e) {
        data.error = 1;
        data.message = "Ошибка соединения";
        res.send(data);
        return;
      } else {
        if (data.email && data.token) {
          db.run(
            "UPDATE users SET email_token='', status=1 WHERE email=? AND email_token=?",
            [data.email, data.token],
            function (err, result) {
              if (err) {
                data.error = 1;
                data.message = "Ошибка подтверждения Email";
                res.redirect(
                  "/login?error=1&message=Ошибка%20подтверждения%20Email"
                );
              } else {
                data.error = 0;
                data.message = "Успешное подтверждение Email";
                res.redirect(
                  "/login?error=0&message=Успешное%20подтверждение%20Email"
                );
              }
            }
          );
        }
      }
    }
  );
});

export default {
  path: "/api/auth",
  handler: app,
};
