import DxtApplianceFormComponent from './dxtApplianceForm.component.js'

/**
 * DXT appliance form - "Company address (non-UK)".
 *
 * Shown instead of the postcode lookup when the company has no UK address; the whole address
 * is captured in a single free-text area.
 */
class DxtApplianceCompanyAddressNonUkPage extends DxtApplianceFormComponent {
  static PATH =
    '/form/preview/draft/get-a-stove-or-other-appliance-certified-for-use-in-smoke-control-areas/company-address-non-uk'

  static HEADING = 'Company address (non-UK)'

  //
  // ===== SELECTORS =====
  //

  // Company address (non-UK)
  get companyAddressInput() {
    return $('#kIndJV')
  }

  //
  // ===== ACTIONS =====
  //

  async enterCompanyAddress(address) {
    await this.companyAddressInput.setValue(address)
  }

  async submit(address) {
    await this.verifyPageLoaded()
    await this.enterCompanyAddress(address)
    await this.clickContinue()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await super.verifyPageLoaded(DxtApplianceCompanyAddressNonUkPage.HEADING)
    await expect(this.companyAddressInput).toBeDisplayed()
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return this.openPath(DxtApplianceCompanyAddressNonUkPage.PATH)
  }
}

export default new DxtApplianceCompanyAddressNonUkPage()
