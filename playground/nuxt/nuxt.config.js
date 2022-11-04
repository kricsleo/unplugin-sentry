
export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'nuxt-playground',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    ['../../dist/nuxt', {
      url: 'https://sentry.io/',
      org: 'kricsleo',
      project: 'demo',
      authToken: 'a38a7e0a606045a1ab35ce877f53975684db943b9c424bb18925db86993dab05',
      publish: true,
      cleanLocal: false,
      // dryRun: true,
    }]
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend(config) {
      config.devtool = 'hidden-source-map';
    },
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
  ],
}
