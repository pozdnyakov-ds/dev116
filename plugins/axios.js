import https from "https";

function jwtCheck(token) {
  var jwt = require("jsonwebtoken");
  if (!token) {
    return false;
  }
  try {
    const jwtData = jwt.decode(token);
    const expires = jwtData.exp || 0;
    return new Date().getTime() / 1000 < expires;
  } catch (e) {
    return false;
  }
}

export default function ({ $axios, store, redirect, app }) {
  $axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false });

  $axios.interceptors.request.use(
    (request) => {
      // Автообновление токена
      if (
        request.headers &&
        request.headers.Authorization &&
        request.headers.Authorization.length > 0
      ) {
        const token = request.headers.Authorization.split(" ")[1] || "";
        if (!jwtCheck(token)) {
          store.dispatch("refreshToken");
          const token = store.state.user.token || "";
          request.headers.Authorization = "Bearer " + token;
        }
      }
      return request;
    },
    (error) => {
      console.error("AXIOS - Ошибка запроса: ", error);
      return Promise.reject(error);
    }
  );

  $axios.onError((error) => {
    if (error.response) {
      if (error.response.status === 401) {
        store.commit("logout");
        redirect("/login");
      }
      if (error.response.status === 500) {
        console.error("Server 500 error!");
      }
    }
  });

  $axios.interceptors.response.use(
    (response) => {
      //console.info("AXIOS - Ответ: ", response.config.url);
      return response;
    },
    (error) => {
      //console.error("AXIOS - Ошибка ответа: ", error);
      return Promise.reject(error);
    }
  );
}
