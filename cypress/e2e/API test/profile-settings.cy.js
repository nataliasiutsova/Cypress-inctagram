const users = require('../../fixtures/loginTestData.json')
import { faker } from '@faker-js/faker'

function createTestData() {
  const randomNumber = Math.floor(Math.random() * users.length)
  return users[randomNumber]
}

let user = createTestData()

let token
let profileId
const fileType = 'image/jpg'

let userData = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  city: faker.location.city(),
  dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
  aboutMe: faker.lorem.words(20),
}

console.log(userData.dateOfBirth)

describe('Users profile-settings ', () => {
  before('Log in', () => {
    cy.request({
      method: 'POST',
      url: 'https://inctagram.net/api/v1/auth/login',
      body: {
        email: user.userEmail,
        password: user.userPassword,
      },
    })
      .then((res) => {
        token = res.body.accessToken
        expect(res.status).to.eq(200)
      })
      .then(() => {
        cy.request({
          method: 'GET',
          url: 'https://inctagram.net/api/v1/auth/me',
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
          expect(res.status).to.eq(200)
          profileId = res.body.userId
        })
      })
  })

  it('Get profile for user', { tags: ['@smoke', '@regression'] }, () => {
    cy.request({
      method: 'GET',
      url: `https://inctagram.net/api/v1/users/profile/${profileId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body).to.have.property('id')
      expect(res.body).to.have.property('userName', user.userName)
      expect(res.body).to.have.property('firstName', null)
      expect(res.body).to.have.property('lastName', null)
      expect(res.body).to.have.property('dateOfBirth', null)
      expect(res.body).to.have.property('city', null)
      expect(res.body).to.have.property('aboutMe', null)
      expect(res.body.avatars).to.be.empty
    })
  })

  it('Update profile for user', { tags: ['@smoke', '@regression'] }, () => {
    cy.request({
      method: 'PUT',
      url: 'https://inctagram.net/api/v1/users/profile',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        city: userData.city,
        dateOfBirth: userData.dateOfBirth,
        aboutMe: userData.aboutMe,
      },
    }).then((res) => {
      expect(res.status).to.eq(204)
    })
  })

  it('Get profile for user after uploading users data', { tags: ['@smoke', '@regression'] }, () => {
    cy.request({
      method: 'GET',
      url: `https://inctagram.net/api/v1/users/profile/${profileId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body).to.have.property('id')
      expect(res.body).to.have.property('userName', user.userName)
      expect(res.body).to.have.property('firstName', userData.firstName)
      expect(res.body).to.have.property('lastName', userData.lastName)
      // expect(res.body).to.have.property('dateOfBirth', userData.dateOfBirth)
      expect(res.body).to.have.property('city', userData.city)
      expect(res.body).to.have.property('aboutMe', userData.aboutMe)
      expect(res.body.avatars).to.be.empty
    })
  })

  it('Upload the avatar for user profile', { tags: ['@smoke', '@regression'] }, () => {
    cy.fixture('images/image.jpg', 'binary').then((file) => {
      const blob = Cypress.Blob.binaryStringToBlob(file, fileType)
      const formdata = new FormData()
      formdata.set('file', blob, 'image.jpg')
      cy.form_request('POST', 'https://inctagram.net/api/v1/users/profile/avatar', formdata, `Bearer ${token}`, function (res) {
        expect(res.status).to.eq(201)
        const json = res.response
        const body = JSON.parse(json)
        cy.log(body)
        expect(body).to.have.property('avatars')
        expect(body.avatars).to.have.length(2)
        expect(body.avatars[0]).to.have.property('url')
        expect(body.avatars[0].url).to.include(`https://storage.yandexcloud.net/users-inctagram/users/${profileId}/avatar`)
        expect(body.avatars[0]).to.have.property('width', 192)
        expect(body.avatars[0]).to.have.property('height', 192)

        expect(body.avatars[1]).to.have.property('url')
        expect(body.avatars[1].url).to.include(`https://storage.yandexcloud.net/users-inctagram/users/${profileId}/avatar`)
        expect(body.avatars[1]).to.have.property('width', 45)
        expect(body.avatars[1]).to.have.property('height', 45)
      })
    })
  })

  it('Delete avatar from users profile', { tags: ['@smoke', '@regression'] }, () => {
    cy.request({
      method: 'DELETE',
      url: 'https://inctagram.net/api/v1/users/profile/avatar',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        expect(res.status).to.eq(204)
      })
      .then(() => {
        cy.request({
          method: 'GET',
          url: `https://inctagram.net/api/v1/users/profile/${profileId}`,
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
          expect(res.body.avatars).to.be.empty
        })
      })
  })
  after('Deleate user data from settings profile', () => {
    cy.request({
      method: 'PUT',
      url: 'https://inctagram.net/api/v1/users/profile',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        firstName: null,
        lastName: null,
        city: null,
        dateOfBirth: null,
        aboutMe: null,
      },
    }).then((res) => {
      expect(res.status).to.eq(204)
    })
  })
})
