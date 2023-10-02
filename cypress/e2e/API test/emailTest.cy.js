import { faker } from '@faker-js/faker'
const { MailSlurp } = require('mailslurp-client')
const apiKey = Cypress.env('API_KEY')
const mailslurp = new MailSlurp({ apiKey })

const userName = faker.word.noun(7)
const userPassword = faker.internet.password({ length: 7, pattern: /\w/ })

let confirmLink
let token

describe('Email testing ', () => {
  before('Create inbox', () => {
    cy.createInbox().then((inbox) => {
      cy.wrap(inbox.id).as('inboxId')
      cy.wrap(inbox.emailAddress).as('emailAddress')
    })
  })

  it('Registration', { tags: '@skip' }, function () {
    cy.request({
      method: 'POST',
      url: 'https://inctagram.net/api/v1/auth/registration',
      body: {
        userName: userName,
        email: this.emailAddress,
        password: userPassword,
      },
    }).then((res) => {
      expect(res.status).to.eq(204)
    })
  })

  it('Check finish registration email', { tags: '@skip' }, function () {
    cy.waitLatestEmail(this.inboxId).then((email) => {
      expect(email.subject).to.equal('Finish registration')
      const parser = new DOMParser(email.body)
      const parseDoc = parser.parseFromString(email.body, 'text/html')
      const title = parseDoc.querySelector('h2')
      expect(title.textContent).to.be.eql('Verify your email address')
      const link = parseDoc.querySelector('a')
      expect(link.textContent).to.contain('Set up your account')
      confirmLink = parseDoc.querySelector('a').getAttribute('href')
    })
  })

  it('Confirm the registration', { tags: '@skip' }, () => {
    cy.confirmCode(confirmLink).then(function (code) {
      cy.request({
        method: 'POST',
        url: 'https://inctagram.net/api/v1/auth/registration-confirmation',
        body: {
          confirmationCode: code,
        },
      }).then((res) => {
        expect(res.status).to.eq(204)
      })
    })
  })

  it('Log in first time after registration', { tags: '@skip' }, function () {
    cy.request({
      method: 'POST',
      url: 'https://inctagram.net/api/v1/auth/login',
      body: {
        email: this.emailAddress,
        password: userPassword,
      },
    }).then((res) => {
      token = res.body.accessToken
      expect(res.status).to.eq(200)
    })
  })

  it('Resend conformation code to email', { tags: '@skip' }, function () {
    cy.createInbox()
      .then((inbox) => {
        cy.wrap(inbox.id).as('inboxId2')
        cy.wrap(inbox.emailAddress).as('emailAddress2')
      })
      .then('', function () {
        cy.request({
          method: 'POST',
          url: 'https://inctagram.net/api/v1/auth/registration',
          body: {
            userName: faker.word.noun(7),
            email: this.emailAddress2,
            password: '123asdfgh',
          },
        }).then((res) => {
          expect(res.status).to.eq(204)
        })
      })
      .then('Resend the finish registration email', function () {
        cy.request({
          method: 'POST',
          url: 'https://inctagram.net/api/v1/auth/registration-email-resending',
          body: {
            email: this.emailAddress2,
            baseUrl: 'https://inctagram.net/auth/failed',
          },
        }).then((res) => {
          expect(res.status).to.eq(204)
        })
      })
  })

  it('Check second finish registration email', { tags: '@skip' }, function () {
    cy.mailslurp.waitLatestEmail(this.inboxId2).then((email) => {
      expect(email.subject).to.equal('Finish registration')
    })
  })

  after('Delete user', () => {
    cy.request({
      method: 'DELETE',
      url: 'https://inctagram.net/api/v1/users/profile',
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200)
    })
  })
})
