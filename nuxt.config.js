import { i18n } from "./locales/i18n-nuxt-config";
import path from "path";
import fs from "fs";
import redirectSSL from "redirect-ssl";

export default {
  //target: 'static',

  loading: {
    color: "green",
    height: "5px",
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "Шаблон от DEV116",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "Dev116 Template" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      // { rel: "stylesheet", href: "/css/style.css" },
      // { rel: "stylesheet", href: "/css/dev_style.css" },
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css",
      },
    ],
    css: [
      // { src: '/vendor/animate.css/animate.min.css', lang: 'css' },
      // { src: '/vendor/aos/aos.css', lang: 'css' },
      // { src: '@/assets/vendor/bootstrap/css/bootstrap.min.css', lang: 'css' },
      // { src: '@/assets/vendor/bootstrap-icons/bootstrap-icons.css', lang: 'css' },
      // { src: '/vendor/boxicons/css/boxicons.min.css', lang: 'css' },
      // { src: '/vendor/glightbox/css/glightbox.min.css', lang: 'css' },
      // { src: '/vendor/swiper/swiper-bundle.min.css', lang: 'css' }
    ],
    script: [
      { type: "text/javascript", src: "/js/main.js", body: true },
      // { type: 'text/javascript', src: '/vendor/purecounter/purecounter.js', body: true },
      // { type: 'text/javascript', src: '/vendor/aos/aos.js', body: true },
      // { type: 'text/javascript', src: '/vendor/glightbox/js/glightbox.min.js', body: true },
      // { type: 'text/javascript', src: '/vendor/isotope-layout/isotope.pkgd.min.js', body: true },
      // { type: 'text/javascript', src: '/vendor/swiper/swiper-bundle.min.js', body: true },
      // { type: 'text/javascript', src: '/vendor/waypoints/noframework.waypoints.js', body: true },
      // { type: 'text/javascript', src: '/vendor/php-email-form/validate.js', body: true }
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    // { src: '@vendor/animate.css/animate.min.css', lang: 'css' },
    // { src: '/vendor/aos/aos.css', lang: 'css' },
    // { src: '@/assets/vendor/bootstrap/css/bootstrap.min.css', lang: 'css' },
    // { src: "@assets/vendor/bootstrap-icons/bootstrap-icons.css", lang: "css" },
    // { src: "@assets/vendor/boxicons/css/boxicons.min.css", lang: "css" },
    // { src: '/vendor/glightbox/css/glightbox.min.css', lang: 'css' },
    // { src: '/vendor/swiper/swiper-bundle.min.css', lang: 'css' },
  ],

  script: [
    // { src: "/vendor/purecounter/purecounter.js", body: true },
    // { src: "/vendor/aos/aos.js", body: true },
    // { src: "@/assets/vendor/bootstrap/js/bootstrap.bundle.min.js", body: true },
    // { src: "/vendor/glightbox/js/glightbox.min.js", body: true },
    // { src: "/vendor/isotope-layout/isotope.pkgd.min.js", body: true },
    // { src: "/vendor/swiper/swiper-bundle.min.js", body: true },
    // { src: "/vendor/waypoints/noframework.waypoints.js", body: true },
    // { src: "/vendor/php-email-form/validate.js", body: true }
    // { type: 'text/javascript', src: '@assets/js/main.js', body: true },
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ["~/plugins/axios"],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    "bootstrap-vue/nuxt",
    // https://go.nuxtjs.dev/axios
    "@nuxtjs/axios",
    // https://go.nuxtjs.dev/pwa
    "@nuxtjs/pwa",
    // https://go.nuxtjs.dev/content
    "@nuxtjs/robots",
    "@nuxtjs/auth-next",
    "@nuxtjs/toast",
    "@nuxtjs/vuetify",
    "@nuxtjs/universal-storage",
    ["@nuxtjs/i18n", i18n],
  ],

  bootstrapVue: {
    icons: true,
  },

  toast: {
    position: "top-right",
    duration: 5000,
    closeOnClick: false,
  },

  env: {
    BASE_URL:
      process.env.NODE_ENV === "development"
        ? "https://localhost:3000"
        : "https://dev116.ru",
    SSL_FILE:
      process.env.NODE_ENV === "development" ? "localhost" : "dev116.ru",
  },

  server: {
    port: 3000,
    https: {
      key:
        process.env.NODE_ENV === "development"
          ? fs.readFileSync(path.resolve("ssl/localhost.key"))
          : fs.readFileSync(path.resolve("ssl/dev116.ru.key")),
      cert:
        process.env.NODE_ENV === "development"
          ? fs.readFileSync(path.resolve("ssl/localhost.crt"))
          : fs.readFileSync(path.resolve("ssl/dev116.ru.crt")),
      passphrase: "dev116",
    },
  },

  robots: [
    {
      UserAgent: "*",
      Disallow: "/",
    },
  ],

  axios: {
    https: false,
    baseUrl:
      process.env.NODE_ENV === "development"
        ? "https://localhost:3000"
        : "https://dev116.ru",
    browserBaseURL:
      process.env.NODE_ENV === "development"
        ? "https://localhost:3000/api/"
        : "https://dev116.ru/api/",
    debug: process.env.NODE_ENV && process.env.NODE_ENV === "development",
    retry: { retries: 3 },
    common: {
      Accept: "application/json",
    },
  },

  auth: {
    strategies: {
      local: {
        autoFetch: false,
        token: {
          property: "token",
          //global: true,
        },
        refreshToken: {
          property: "refresh_token",
        },
        user: {
          property: "user",
        },
        endpoints: {
          login: { url: "/auth/login", method: "post" },
          refresh: { url: "/auth/refresh", method: "post" },
          logout: false,
          user: false, //{ url: "/user/auth", method: "get" },
        },
        tokenRequired: false,
        tokenType: "Bearer",
        autoLogout: false, //true,
      },
    },
    cookie: {
      options: {
        secure: process.env.NODE_ENV && process.env.NODE_ENV === "production",
      },
    },
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: "ru",
    },
  },

  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel: {
      compact: true,
    },
    extractCSS: true,
  },

  serverMiddleware: [
    "redirect-ssl",
    { path: "/api", handler: "~/api/index.js" },
    { path: "/api/auth", handler: "~/api/auth.js" },
    { path: "/api/users", handler: "~/api/users.js" },
  ],
};
