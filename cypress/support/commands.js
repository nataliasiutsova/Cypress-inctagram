const regSelectors = require('../fixtures/registrationSelectors.json')
const { MailSlurp } = require('mailslurp-client')
const apiKey = Cypress.env('API_KEY')
const mailslurp = new MailSlurp({ apiKey })

Cypress.Commands.add('createInbox', () => {
  const inbox = mailslurp.createInbox()
  return inbox
})

Cypress.Commands.add('waitLatestEmail', (inboxId) => {
  const email = mailslurp.waitForLatestEmail(inboxId, 30000, true)
  return email
})

Cypress.Commands.add('registration', (userName, userEmail, userPassword) => {
  cy.get(regSelectors.Name).type(userName)
  cy.get(regSelectors.Mail).type(userEmail)
  cy.get(regSelectors.Password).type(userPassword)
  cy.get(regSelectors.Password2).type(userPassword)
  cy.get(regSelectors.ButtonSignUp).click({ force: true })
})

Cypress.on('uncaught:exception', (err, runnable, promise) => {
  // when the exception originated from an unhandled promise
  // rejection, the promise is provided as a third argument
  // you can turn off failing the test in this case
  if (promise) {
    return false
  }
  // we still want to ensure there are no other unexpected
  // errors, so we let them fail the test
})

Cypress.Commands.add('form_request', (method, url, formData, token, done) => {
  const request = new XMLHttpRequest()
  request.open(method, url, false)
  request.setRequestHeader('Authorization', token)
  request.onload = function () {
    done(request)
  }
  request.send(formData)
})

Cypress.Commands.add('confirmCode', (confirmLink) => {
  const codeMatch = confirmLink.match(/code=([a-zA-Z0-9-]+)/)
  if (codeMatch && codeMatch[1]) {
    let code = codeMatch[1]
    return code
  }
})
