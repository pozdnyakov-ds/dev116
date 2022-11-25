import { $fetch } from "ohmyfetch/node";

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
  if (!captchaToken) {
    res.send(data);
    return;
  }
  const response = await $fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SERVER_KEY}&response=${captchaToken}`
  );
  console.log("Captcha server side: ", response);

  if (!response.success || response.score < 0.5) {
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
                    expiresIn: "1m", // 30m
                  }
                );
                refreshToken = jwt.sign(
                  { id: row.id, email: email, scope: data.scope },
                  process.env.REFRESH_TOKEN_SECRET,
                  {
                    expiresIn: "60d",
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

app.post("/reg", function (req, res, next) {
  const sqlite3 = require("sqlite3").verbose();

  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: "smtp.timeweb.ru",
    port: 465,
    secure: true,
    auth: {
      user: "info@dev116.ru",
      pass: "Info9201",
    },
  });

  var name = req.body.name;
  var email = req.body.email;
  var uniqueEmail = true;
  var password = req.body.password;
  var id = Math.random().toString(32).slice(2);
  var data = {
    error: 0,
    message: "",
  };

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
                  "INSERT INTO users (id, name, email, password, email_token) VALUES (?,?,?,?,?)",
                  [id, name, email, password, emailToken],
                  function (err, result) {
                    if (err) {
                      data.error = 1;
                      data.message = "Ошибка Insert";
                      res.send(data);
                      return;
                    } else {
                      var content = `<b>Ссылка для подтверждения регистрации (действительна 24 часа):</b> 
                          <a target=_blank href="${BASE_URL}/api/submit?email=${email}&token=${emailToken}">Подтвердить</a><br>`;

                      const info = transporter.sendMail(
                        {
                          from: "Dev116 <info@dev116.ru>",
                          to: email,
                          subject:
                            "Подтверждение регистрации на проекте Dev116.ru",
                          text: ``,
                          html: content,
                          sender: "info@dev116.ru",
                          replyTo: "info@dev116.ru",
                          dkim: {
                            domainName: "dev116.ru",
                            keySelector: "2022",
                            privateKey:
                              "-----BEGIN RSA PRIVATE KEY-----MIICXgIBAAKBgQC2RKmxTvUs0/wkAntEU+hRh4L6PyAf54M9e66y/21NgTH2dwbzHQfvot8N49lAfUtcLqr6bAJRaOzjzUuPmjm/MCWcY9N/to26CKPHYS5hnucl5iohEIONn2kw+hEC399kOgxQAQRm5RZGSdM0QS0GfzUAQ30emLWRLjhDgDDSDwIDAQABAoGBAJIPeAS0h1jDD50zt+BLdTJQa69qAq5OcidFA/xBIDApxgYB4DnWG9P3KtQQsLozLb7TTwSapUjj0mHC1DhhmL+4qRaoAI5BY35Ionwh5w8xgQatQkIo4iPFmQt3vzPXAdIlYCMemSUCjfnfP82lgcE7Oe/G4GQLKdmXAPEpw3CxAkEA4X++yasOrmubOiQN2DBK8UkFHJbV+yGi/NZ+n5GDIhu1VmAW80VUHsSqLzG4IUF8ZWi25KSiVaAD9UUtLjsI5QJBAM7r++qXZOJ+VA4litrW81rMbOWR7mdSWpgjOJMMh9T6fxMAwR4Qor19uNuTWqjbpRnP0hPJd6cmGhKJJ0A0Q+MCQQC9Ym1YsBpPcL5YsSkTdVOrm5j4btHd7V0WngqQd0Q75CuDFIaR35sLkD4iDs7G11njTXO1SXOxGAfa+TM9zYTlAkBkNEFdfI09ZcHcy+9vRLK6oM6HaeESpf37OOs3wtSwndIV6MKchZ/Ztd1kb/pyVVOhqVNpg6HvDvOHUGXyoJzTAkEAkQIMfXPos3Ky1EnnQFjj4muahIG86iHcGb+Hsnc/onL4D+uBO42yernXMcW8IuJq8nTxLSSmnCRhw+7f4TtPzg==-----END RSA PRIVATE KEY-----",
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

app.post("/refresh/:token", function (req, res, next) {
  // const token = r.split(" ")[1] || null;
  var newToken = null;
  var newRefreshToken = null;
  var user = null;

  const token = req.params.token;
  //console.log("API REFRESH - Входящий параметр", token);

  var decodedData = null;

  var jwt = require("jsonwebtoken");
  try {
    decodedData = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    //console.log("REFRESH decodedData: ", decodedData);
  } catch (e) {
    //console.log("REFRESH - Ошибка проверки рефреш-токена: ", e);
    //$route.push("/login");
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
                expiresIn: "30m",
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

app.post("/forgot", function (req, res, next) {
  const sqlite3 = require("sqlite3").verbose();

  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: "smtp.timeweb.ru",
    port: 465,
    secure: true,
    auth: {
      user: "info@dev116.ru",
      pass: "Info9201",
    },
  });

  var email = req.body.email;
  var data = {
    error: 0,
    message: "",
  };

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
                  from: "Dev116 <info@dev116.ru>",
                  to: email,
                  subject: "Подтверждение сброса пароля на проекте Dev116.ru",
                  text: ``,
                  html: content,
                  sender: "info@dev116.ru",
                  replyTo: "info@dev116.ru",
                  dkim: {
                    domainName: "dev116.ru",
                    keySelector: "2022",
                    privateKey:
                      "-----BEGIN RSA PRIVATE KEY-----MIICXgIBAAKBgQC2RKmxTvUs0/wkAntEU+hRh4L6PyAf54M9e66y/21NgTH2dwbzHQfvot8N49lAfUtcLqr6bAJRaOzjzUuPmjm/MCWcY9N/to26CKPHYS5hnucl5iohEIONn2kw+hEC399kOgxQAQRm5RZGSdM0QS0GfzUAQ30emLWRLjhDgDDSDwIDAQABAoGBAJIPeAS0h1jDD50zt+BLdTJQa69qAq5OcidFA/xBIDApxgYB4DnWG9P3KtQQsLozLb7TTwSapUjj0mHC1DhhmL+4qRaoAI5BY35Ionwh5w8xgQatQkIo4iPFmQt3vzPXAdIlYCMemSUCjfnfP82lgcE7Oe/G4GQLKdmXAPEpw3CxAkEA4X++yasOrmubOiQN2DBK8UkFHJbV+yGi/NZ+n5GDIhu1VmAW80VUHsSqLzG4IUF8ZWi25KSiVaAD9UUtLjsI5QJBAM7r++qXZOJ+VA4litrW81rMbOWR7mdSWpgjOJMMh9T6fxMAwR4Qor19uNuTWqjbpRnP0hPJd6cmGhKJJ0A0Q+MCQQC9Ym1YsBpPcL5YsSkTdVOrm5j4btHd7V0WngqQd0Q75CuDFIaR35sLkD4iDs7G11njTXO1SXOxGAfa+TM9zYTlAkBkNEFdfI09ZcHcy+9vRLK6oM6HaeESpf37OOs3wtSwndIV6MKchZ/Ztd1kb/pyVVOhqVNpg6HvDvOHUGXyoJzTAkEAkQIMfXPos3Ky1EnnQFjj4muahIG86iHcGb+Hsnc/onL4D+uBO42yernXMcW8IuJq8nTxLSSmnCRhw+7f4TtPzg==-----END RSA PRIVATE KEY-----",
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

app.post("/reset", function (req, res, next) {
  const sqlite3 = require("sqlite3").verbose();

  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: "smtp.timeweb.ru",
    port: 465,
    secure: true,
    auth: {
      user: "info@dev116.ru",
      pass: "Info9201",
    },
  });

  var email = req.body.email || "";
  var token = req.body.token || "";
  var password = req.body.password || "";
  var data = {
    error: 0,
    message: "",
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
                  from: "Dev116 <info@dev116.ru>",
                  to: email,
                  subject: "Подтверждение смены пароля на проекте Dev116.ru",
                  text: ``,
                  html: content,
                  sender: "info@dev116.ru",
                  replyTo: "info@dev116.ru",
                  dkim: {
                    domainName: "dev116.ru",
                    keySelector: "2022",
                    privateKey:
                      "-----BEGIN RSA PRIVATE KEY-----MIICXgIBAAKBgQC2RKmxTvUs0/wkAntEU+hRh4L6PyAf54M9e66y/21NgTH2dwbzHQfvot8N49lAfUtcLqr6bAJRaOzjzUuPmjm/MCWcY9N/to26CKPHYS5hnucl5iohEIONn2kw+hEC399kOgxQAQRm5RZGSdM0QS0GfzUAQ30emLWRLjhDgDDSDwIDAQABAoGBAJIPeAS0h1jDD50zt+BLdTJQa69qAq5OcidFA/xBIDApxgYB4DnWG9P3KtQQsLozLb7TTwSapUjj0mHC1DhhmL+4qRaoAI5BY35Ionwh5w8xgQatQkIo4iPFmQt3vzPXAdIlYCMemSUCjfnfP82lgcE7Oe/G4GQLKdmXAPEpw3CxAkEA4X++yasOrmubOiQN2DBK8UkFHJbV+yGi/NZ+n5GDIhu1VmAW80VUHsSqLzG4IUF8ZWi25KSiVaAD9UUtLjsI5QJBAM7r++qXZOJ+VA4litrW81rMbOWR7mdSWpgjOJMMh9T6fxMAwR4Qor19uNuTWqjbpRnP0hPJd6cmGhKJJ0A0Q+MCQQC9Ym1YsBpPcL5YsSkTdVOrm5j4btHd7V0WngqQd0Q75CuDFIaR35sLkD4iDs7G11njTXO1SXOxGAfa+TM9zYTlAkBkNEFdfI09ZcHcy+9vRLK6oM6HaeESpf37OOs3wtSwndIV6MKchZ/Ztd1kb/pyVVOhqVNpg6HvDvOHUGXyoJzTAkEAkQIMfXPos3Ky1EnnQFjj4muahIG86iHcGb+Hsnc/onL4D+uBO42yernXMcW8IuJq8nTxLSSmnCRhw+7f4TtPzg==-----END RSA PRIVATE KEY-----",
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

app.get("/activation", function (req, res, next) {
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
                  "/login?error=0&message=Ошибка%20подтверждения%20Email"
                );
              } else {
                data.error = 0;
                data.message = "Успешное подтверждение Email";
                res.redirect(
                  "/login?error=1&message=Успешное%20подтверждение%20Email"
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
