import { faker } from '@faker-js/faker';
const regTestData = require('../../fixtures/regTestData.json');
const regSelectors = require('../../fixtures/registrationSelectors.json');

const generateRandomName = () => {
	let randomName;
	do {
		randomName = faker.internet.userName().replace(/[\W_]+/g, ''); // Remove special symbols and dots
	} while (randomName.length < 6 || randomName.length > 30);

	return randomName;
};

const generateRandomPassword = () => {
	let randomPassword;
	do {
		randomPassword = faker.internet.password();
	} while (randomPassword.length < 6 || randomPassword.length > 20);

	return randomPassword;
};

let randomName = generateRandomName();
let randomEmail = faker.internet.email();
let randomPassword = generateRandomPassword();

describe('Registration Page', () => {
	beforeEach('Visit', () => {
		cy.visit(
			'https://inctagram-git-staging-fightersforjustice.vercel.app/auth/registration'
		);
	});

	it('Validate RegistrationPage', () => {
		cy.get(regSelectors.Text).contains('Do you have an account?');
		cy.get('.RegistrationForm_SignIn__S8W05').contains('Sign In');
	});

	it('Should register a new user with unique data and get message email sent', () => {
		cy.get(regSelectors.Name).clear().type(randomName);
		cy.get(regSelectors.Mail).clear().type(randomEmail);
		cy.get(regSelectors.Password).clear().type(randomPassword);
		cy.get(regSelectors.Password2).clear().type(randomPassword);
		cy.get('.RegistrationForm_label__i9EQP').contains(
			'I agree to the Terms of Service and Privacy Policy'
		);
		cy.get(regSelectors.CheckMark).check();
		cy.get(regSelectors.ButtonSignUp).click();
		cy.get('.Modal_text__GjVrh')
			.contains(
				`We have sent a link to confirm your email to ${randomEmail}`
			)
			.should('be.visible');
		cy.get('.Modal_buttonClose__mIbC9 > img').click();
	});

	it('Validation error that user already exist', () => {
		cy.get(regSelectors.Name).clear().type('turpicrypto');
		cy.get(regSelectors.Mail).clear().type('turpicrypto@gmail.com');
		cy.get(regSelectors.Password).clear().type('11111111');
		cy.get(regSelectors.Password2).clear().type('11111111');
		cy.get(regSelectors.CheckMark).check();
		cy.get(regSelectors.ButtonSignUp).click();
		//cy.get(regSelectors.ButtonSignUp).click()
		cy.get(regSelectors.RegError).contains(
			'User with this email is already exist'
		);
		cy.get(regSelectors.Name).clear().type(randomName);
		cy.get(regSelectors.Mail).clear().type(randomEmail);
		cy.get(regSelectors.ButtonSignUp).click();
	});

	it('Registration with blank fields , Sign Up is disabled', () => {
		cy.get(regSelectors.ButtonSignUp).should('be.disabled');
	});

	it('Registration with incorrect email format', () => {
		cy.wrap(regTestData.invalidEmail).each(($item, index) => {
			cy.get(regSelectors.Name).clear().type(randomName);
			cy.get(regSelectors.Mail).clear().type($item);
			cy.get(regSelectors.Password).clear().type(randomPassword);
			cy.get(regSelectors.Password2).clear().type(randomPassword);
			cy.get(regSelectors.RegError).contains('Invalid email format');
			cy.get(regSelectors.ButtonSignUp).should('be.disabled');
		});
	});

	it('Registration with incorrect userName format', () => {
		cy.wrap(regTestData.invalidName).each(($item, index) => {
			cy.get(regSelectors.Name).clear().type($item);
			cy.get(regSelectors.Mail).clear().type(randomEmail);
			cy.get(regSelectors.Password).clear().type(randomPassword);
			cy.get(regSelectors.Password2).clear().type(randomPassword);
			if (index === 0) {
				cy.get(regSelectors.ButtonSignUp).should('be.disabled');
			} else {
				// Check for specific error messages based on the invalid user name
				if ($item.length < 6) {
					cy.get(regSelectors.RegError).contains(
						'Username must be longer than or equal to 6 characters'
					);
					cy.get(regSelectors.ButtonSignUp).should('be.disabled');
				} else if ($item.includes(' ')) {
					cy.get(regSelectors.RegError).contains(
						'* Invalid username format'
					);
					cy.get(regSelectors.ButtonSignUp).should('be.disabled');
				} else if ($item.length > 30) {
					cy.get(regSelectors.RegError).contains(
						'Username must be shorter than or equal to 30 characters'
					);
					cy.get(regSelectors.ButtonSignUp).should('be.disabled');
				}
			}
		});
	});

	it('Registration with incorrect pasword format', () => {
		cy.wrap(regTestData.Password).each(($item, index) => {
			cy.get(regSelectors.Name).clear().type(randomName);
			cy.get(regSelectors.Mail).clear().type(randomEmail);
			cy.get(regSelectors.Password).clear().type($item);
			cy.get(regSelectors.Password2).clear().type($item);
			if ($item.length < 6) {
				cy.get(regSelectors.RegError).contains(
					'Password must be longer than or equal to 6 characters'
				);
				cy.get(regSelectors.ButtonSignUp).should('be.disabled');
			} else if ($item.includes(' ')) {
				cy.get(regSelectors.RegError).contains(
					'*Required field to fill in'
				);
				cy.get(regSelectors.ButtonSignUp).should('be.disabled');
			} else if ($item.length > 20) {
				cy.get(regSelectors.RegError).contains(
					'Password must be shorter than or equal to 20 characters'
				);
				cy.get(regSelectors.ButtonSignUp).should('be.disabled');
			}
		});
	});
});
