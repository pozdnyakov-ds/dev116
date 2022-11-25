import https from "https";

export default function ({ $axios, $storage, redirect, app }) {
  $axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false });

  $axios.interceptors.request.use(
    (config) => {
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
