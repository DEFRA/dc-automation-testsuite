import DxtApplianceFormComponent from './dxtApplianceForm.component.js'

/**
 * DXT appliance form - "Company name" (first page of the journey).
 */
class DxtApplianceCompanyNamePage extends DxtApplianceFormComponent {
  static PATH =
    '/form/preview/draft/get-a-stove-or-other-appliance-certified-for-use-in-smoke-control-areas/company-name'

  static HEADING = 'Company name'

  //
  // ===== SELECTORS =====
  //

  // Company name
  get companyNameInput() {
    return $('#CTGxGs')
  }

  //
  // ===== ACTIONS =====
  //

  async enterCompanyName(companyName) {
    await this.companyNameInput.setValue(companyName)
  }

  async submit(companyName) {
    await this.verifyPageLoaded()
    await this.enterCompanyName(companyName)
    await this.clickContinue()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await super.verifyPageLoaded(DxtApplianceCompanyNamePage.HEADING)
    await expect(this.companyNameInput).toBeDisplayed()
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return this.openPath(DxtApplianceCompanyNamePage.PATH)
  }
}

export default new DxtApplianceCompanyNamePage()
