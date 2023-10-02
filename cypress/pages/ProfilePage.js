export class ProfilePage {
  elements = {
    profileSettings: () => cy.get('.SideBarLayout_background_container__9aTMC > :nth-child(1) > div > button'),
    addPhotoButton: () => cy.get('.AddAvatar_blocButton__9nHxD > .Button_button__mwjOx'),
    saveChangesButton: () => cy.get('.ProfileTabs_form__ou2WA > .Button_button__mwjOx'),
    errorMessage: () => cy.get('.Textarea_error_message__klEXr'),
    selectFromComputerButton: () => cy.get('.start_button__J_cSb > .Button_button__mwjOx'),
    addProfilePhoto: () => cy.get('[data-testid="closeModal"] > img'),
  }
}
