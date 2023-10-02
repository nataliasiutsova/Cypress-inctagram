const { defineConfig } = require('cypress')
const dotenv = require('dotenv')
dotenv.config()

module.exports = defineConfig({
  watchForFileChanges: false,
  env: {
    API_KEY: process.env.MAILSLURP_API_KEY,
    allureReuseAfterSpec: true,
  },
  e2e: {
    // supportFile:cypress/support/e2e.js,
    // specPattern: 'e2e/**/*.cy.{js,jsx,ts,tsx}',
    // baseUrl: 'https://inctagram.net/',
    baseUrl: 'https://inctagram-git-staging-fightersforjustice.vercel.app/',
    setupNodeEvents(on, config) {
      require('@cypress/grep/src/plugin')(config)
      const allureWriter = require('@shelex/cypress-allure-plugin/writer')
      allureWriter(on, config)
      return config
    },
  },
})
