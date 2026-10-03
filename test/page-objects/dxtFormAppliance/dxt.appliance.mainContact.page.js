import DxtApplianceFormComponent from './dxtApplianceForm.component.js'

/**
 * DXT appliance form - "Main contact".
 */
class DxtApplianceMainContactPage extends DxtApplianceFormComponent {
  static PATH =
    '/form/preview/draft/get-a-stove-or-other-appliance-certified-for-use-in-smoke-control-areas/main-contact'

  static HEADING = 'Main contact'

  //
  // ===== SELECTORS =====
  //

  // Name
  get nameInput() {
    return $('#CfdMSm')
  }

  // Email address
  get emailAddressInput() {
    return $('#gTshkc')
  }

  // Alternate email address (optional)
  get alternateEmailAddressInput() {
    return $('#eDOPFB')
  }

  // Phone number (optional)
  get phoneNumberInput() {
    return $('#JIeTGU')
  }

  //
  // ===== ACTIONS =====
  //

  async enterContactDetails({
    name,
    emailAddress,
    alternateEmailAddress,
    phoneNumber
  }) {
    await this.nameInput.setValue(name)
    await this.emailAddressInput.setValue(emailAddress)

    if (alternateEmailAddress) {
      await this.alternateEmailAddressInput.setValue(alternateEmailAddress)
    }

    if (phoneNumber) {
      await this.phoneNumberInput.setValue(phoneNumber)
    }
  }

  async submit(contact) {
    await this.verifyPageLoaded()
    await this.enterContactDetails(contact)
    await this.clickContinue()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await super.verifyPageLoaded(DxtApplianceMainContactPage.HEADING)
    await expect(this.nameInput).toBeDisplayed()
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return this.openPath(DxtApplianceMainContactPage.PATH)
  }
}

export default new DxtApplianceMainContactPage()
