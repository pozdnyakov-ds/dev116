import https from "https";

export default function ({ $axios, store, redirect, app }) {
  $axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false });

  $axios.interceptors.request.use(
    (request) => {
      // Для токена в каждом запросе:
      // request.headers.common['Authorization'] = 'Bearer ' + token; // взять из кукесов или универсального сториджа.
      //console.info("AXIOS - Запрос: ", request.url);
      return request;
    },
    (error) => {
      //console.error("AXIOS - Ошибка запроса: ", error);
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
