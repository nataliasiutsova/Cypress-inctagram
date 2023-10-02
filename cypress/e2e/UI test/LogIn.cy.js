import { LoginPage } from '../../pages/LoginPage';
const users = require('../../fixtures/loginTestData.json');
const regTestData = require('../../fixtures/regTestData.json');

function createTestData() {
	const randomNumber = Math.floor(Math.random() * users.length);
	return users[randomNumber];
}

let user = createTestData();

describe('Login Page', () => {
	beforeEach('Visit Sign in page', () => {
		cy.visit('auth/login');
	});

	let loginPage = new LoginPage();

	it('Validate LoginPage elements ', { tags: '@regression' }, () => {
		loginPage.elements.emailField().should('exist');
		loginPage.elements.passwordField().should('exist');
		loginPage.elements
			.loginButton()
			.should('exist')
			.and('contain', 'Sign In');
		loginPage.elements
			.registrationLink()
			.should('exist')
			.and('contain', 'Sign Up');
		loginPage.elements
			.forgotPasswordLink()
			.should('exist')
			.and('contain', 'Forgot Password');
	});

	it('Positive login UI', { tags: ['@smoke', '@regression'] }, () => {
		loginPage.login(user.userEmail, user.userPassword);
		cy.url().should('include', 'home');
	});

	it('Login with wrong email', { tags: '@regression' }, () => {
		let arr = user.userEmail.split('');
		arr.splice(1, 1);
		let incEmail = arr.join('');
		loginPage.login(incEmail, user.userPassword);
		cy.wait(3000);
		loginPage.elements
			.errorMesLogin()
			.should('be.visible')
			.and('contain', 'Authorization error');
		cy.url().should('include', 'auth/login');
	});

	it('Login with wrong password', { tags: '@regression' }, () => {
		loginPage.login(user.userEmail, user.userPassword.slice(0, -1));
		cy.wait(3000);
		loginPage.elements
			.errorMesLogin()
			.should('be.visible')
			.and('contain', 'invalid password or email');
		cy.url().should('include', 'auth/login');
	});

	it('Check validation of the email field', { tags: '@regression' }, () => {
		cy.wrap(regTestData.invalidEmail).each(($item) => {
			loginPage.elements.emailField().clear().type($item);
			loginPage.elements.passwordField().clear();
			loginPage.elements
				.invEmailMess()
				.should('be.visible')
				.and('contain', 'Invalid email format');
			cy.url().should('include', 'auth/login');
		});
	});

	it('Login with the blank email field', { tags: '@regression' }, () => {
		loginPage.elements.passwordField().type(user.userPassword);
		loginPage.elements.loginButton().click();
		loginPage.elements
			.blankEmailMess()
			.should('be.visible')
			.and('contain', 'Required field to fill in');
		cy.url().should('include', 'auth/login');
	});

	it(
		'Check validation of the password field',
		{ tags: '@regression' },
		() => {
			cy.wrap(regTestData.invalidPassword).each(($item) => {
				loginPage.elements.emailField().clear().type(user.userEmail);
				loginPage.elements.passwordField().clear().type($item);
				loginPage.elements.loginButton().click();
				if ($item.length < 6) {
					loginPage.elements
						.blankPasMess()
						.should('be.visible')
						.and(
							'contain',
							'Password must be longer than or equal to 6 characters'
						);
					cy.url().should('include', 'auth/login');
				} else if ($item.length > 20) {
					loginPage.elements
						.blankPasMess()
						.should('be.visible')
						.and(
							'contain',
							'Password must be shorter than or equal to 20 characters'
						);
					cy.url().should('include', 'auth/login');
				}
			});
		}
	);

	it('Login with the blank password field', { tags: '@regression' }, () => {
		loginPage.elements.emailField().type(user.userEmail);
		loginPage.elements.loginButton().click();
		loginPage.elements
			.blankPasMess()
			.should('be.visible')
			.and('contain', 'Required field to fill in');
		cy.url().should('include', 'auth/login');
	});
});
