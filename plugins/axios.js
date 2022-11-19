export default function ({ $axios, $auth, $storage, redirect, app }) {
  $axios.interceptors.request.use(
    (config) => {
      //console.info("AXIOS - Запрос: ", config);
      return config;
    },
    (error) => {
      console.error("AXIOS - Ошибка запроса: ", error);
      return Promise.reject(error);
    }
  );

  $axios.interceptors.response.use(
    (response) => {
      //console.info("AXIOS - Ответ: ", response.config);
      return response;
    },
    (error) => {
      //console.error("AXIOS - Ошибка ответа: ", error);
      return Promise.reject(error);
    }
  );
}
