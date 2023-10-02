import { ProfilePage } from '../../pages/ProfilePage';
import { LoginPage } from '../../pages/LoginPage';

function generateRandomText(length) {
	let result = '';
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters.charAt(randomIndex);
	}

	return result;
}
let loginPage = new LoginPage();
let profilePage = new ProfilePage();

describe('Profile Test', () => {
	beforeEach('Visit Sign in page', () => {
		cy.visit('auth/login');
		cy.get(':nth-child(3) > .Inputs_input__0eCrr')
			.clear()
			.type('anna_vyalova@yahoo.com');
		cy.get(':nth-child(4) > .Inputs_input__0eCrr').clear().type('8910202');
		cy.get('.Button_button__mwjOx').click();
		loginPage.elements.emailField().clear().type('anna_vyalova@yahoo.com');
		loginPage.elements.passwordField().clear().type('8910202');
		loginPage.elements.loginButton().click();
	});

	it('Profile Settings check positive', () => {
		cy.get(
			'.SideBarLayout_background_container__9aTMC > :nth-child(1) > div > button'
		).click();
		cy.get('.AddAvatar_blocButton__9nHxD > .Button_button__mwjOx').should(
			'exist'
		);
		const randomText = generateRandomText(200);
		profilePage.elements.profileSettings().click();
		cy.contains('General Information').should('be.visible');
		cy.contains('Devices').should('be.visible');
		cy.contains('Account Management').should('be.visible');
		cy.contains('My Payments').should('be.visible');
		cy.get('.Header_language__7aIhX').click();
		cy.get('.Header_language__7aIhX').contains('Russian').click();
		cy.contains('Общая информация').should('be.visible');
		cy.contains('Устройства').should('be.visible');
		cy.contains('Управление аккаунтом').should('be.visible');
		cy.contains('Мои платежи').should('be.visible');
		cy.get('#username')
			.should('have.css', 'writing-mode', 'horizontal-tb')
			.should('have.value', 'AVyalova');
		cy.get('#first-name').clear().type('Anna'); // Type text into the first name field
		cy.get('#last-name').clear().type('Vyalova'); // Type text into the last name field
		cy.get('#city').clear().type('Bilbao'); // Type text into the city field
		cy.get('#date').clear().type('06/18/1984');
		cy.get('.ProfileTabs_form__ou2WA > .Button_button__mwjOx').click();
		cy.get('#aboutMe').clear().type(randomText);
		profilePage.elements.saveChangesButton().click();
	});

	it('Profile Settings validation AboutMe', () => {
		const randomText = generateRandomText(201);
		profilePage.elements.profileSettings().click();
		cy.get('#aboutMe').clear().type(randomText);
		profilePage.elements
			.errorMessage()
			.contains('The number of characters must not exceed 200');
		profilePage.elements.saveChangesButton().should('be.disabled');
	});

	it('Profile Settings validation Future date', () => {
		profilePage.elements.profileSettings().click();
		cy.get('#date').clear().type('12/31/3000');
		cy.contains('Error!').should('be.visible');
	});

	it.only('Upload photo check', () => {
		profilePage.elements.profileSettings().click();
		profilePage.elements.addPhotoButton().should('exist');
		profilePage.elements.addPhotoButton().click();
		cy.contains('Add a Profile Photo').should('be.visible');
		profilePage.elements.addProfilePhoto().should('exist');
		profilePage.elements.addProfilePhoto().click();
		cy.contains('General Information').should('be.visible');
		profilePage.elements.addPhotoButton().click();
		profilePage.elements
			.selectFromComputerButton()
			.should('be.visible')
			.should('contain', 'Select from Computer');
		profilePage.elements.selectFromComputerButton().click();
		cy.fixture('image.jpg').then((fileContent) => {
			cy.get('input[type="file"]').then(($input) => {
				// Create a Blob from the file content
				const blob = Cypress.Blob.base64StringToBlob(
					fileContent,
					'image/jpeg'
				);

				// Create a File from the Blob and assign it to the input
				const testFile = new File([blob], 'image.jpg', {
					type: 'image/jpeg',
				});
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(testFile);
				$input[0].files = dataTransfer.files;
			});
		});
	});
});
