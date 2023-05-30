export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "gt-save",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/images/logo.svg" }],
    script: [
      {
        type: "module",
        src: "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js",
        body: true,
      },
      {
        src: "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js",
        body: true,
      },
      {
        src: "https://cdn.jsdelivr.net/npm/minidenticons@3.1.2/minidenticons.min.js",
        type: "module",
        body: true,
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ["@/assets/css/main.css"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    postcss: {
      postcssOptions: {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
        },
      },
    },
  },
  publicRuntimeConfig: {
    privKey: process.env.PRIV_KEY2,
    cKey: process.env.COVALENT_KEY,
  },
};
