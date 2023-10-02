const users = require('../../fixtures/loginTestData.json')

describe('Login API test', () => {
  function createTestData() {
    const randomNumber = Math.floor(Math.random() * users.length)
    return users[randomNumber]
  }

  let user = createTestData()
  let bodyCookie
  let token

  it('Possitive login', { tags: ['@smoke', '@regression'] }, () => {
    cy.log(user)
    cy.request({
      method: 'POST',
      url: 'https://inctagram.net/api/v1/auth/login',
      body: {
        email: user.userEmail,
        password: user.userPassword,
      },
    }).then((res) => {
      expect(res.status).to.eq(200)
      token = res.body.accessToken
      expect(res.body).to.have.property('accessToken')
      expect(res.headers).to.have.property('set-cookie')
      bodyCookie = res.headers['set-cookie']
    })
  })

  it('Get information about current user', { tags: ['@smoke', '@regression'] }, () => {
    cy.log(user)
    cy.request({
      method: 'GET',
      url: 'https://inctagram.net/api/v1/auth/me',
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body).to.have.property('userId')
      expect(res.body).to.have.property('userName')
      expect(res.body).to.have.property('email', user.userEmail)
    })
  })

  it('Login with wrong email', { tags: '@regression' }, () => {
    let arr = user.userEmail.split('')
    arr.splice(1, 1)
    let incEmail = arr.join('')
    cy.request({
      method: 'POST',
      url: 'https://inctagram.net/api/v1/auth/login',
      body: {
        email: incEmail,
        password: user.userPassword,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401)
      expect(res.body).to.have.property('error')
      expect(res.body).to.have.property('statusCode')
      expect(res.body).to.have.property('messages')
      expect(res.body.error).to.eq('Unauthorized')
      expect(res.body.messages[0].message).to.eq('Authorization error')
    })
  })

  it('Login with wrong password', { tags: '@regression' }, () => {
    cy.request({
      method: 'POST',
      url: 'https://inctagram.net/api/v1/auth/login',
      body: {
        email: user.userEmail,
        password: user.userPassword.slice(0, -1),
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400)
      expect(res.body).to.have.property('error')
      expect(res.body).to.have.property('statusCode')
      expect(res.body).to.have.property('messages')
      expect(res.body.messages).to.eq('invalid password or email')
    })
  })

  it('Logout', { tags: ['@smoke', '@regression'] }, () => {
    cy.request({
      method: 'POST',
      url: 'https://inctagram.net/api/v1/auth/logout',
      headers: { Cookie: bodyCookie },
    }).then((res) => {
      expect(res.status).to.eq(204)
    })
  })
})
