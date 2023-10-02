export class LoginPage {
  elements = {
    emailField: () => cy.get(':nth-child(3) > .Inputs_input__0eCrr'),
    passwordField: () => cy.get(':nth-child(4) > .Inputs_input__0eCrr'),
    loginButton: () => cy.get('.Button_button__mwjOx'),
    registrationLink: () => cy.get('.LoginForm_SignUp__HdCNz'),
    forgotPasswordLink: () => cy.get('.LoginForm_forgot_password_link__2xS_j'),
    blankEmailMess: () => cy.get(':nth-child(3) > .Inputs_errorMessage__4AKqh'),
    invEmailMess: () => cy.get('.Inputs_errorMessage__4AKqh'),
    blankPasMess: () => cy.get(':nth-child(4) > .Inputs_errorMessage__4AKqh'),
    errorMesLogin: () => cy.get('.Toastify__toast-container.Toastify__toast-container--top-right'),
  }
  login(userEmail, userPassword) {
    this.elements.emailField().type(userEmail)
    this.elements.passwordField().type(userPassword)
    this.elements.loginButton().click()
  }
}
