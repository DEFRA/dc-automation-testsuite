import DxtFuelFormComponent from './dxtFuelForm.component.js'

/**
 * DXT fuel form - "Letter from manufacturer". Rebrand branch only, between brand-name and
 * declaration - it takes the place of the Manufacture branch's test-reports page.
 * Information-only: the permission letter is emailed to HETAS separately, so there is nothing
 * to fill in and submit() takes no data.
 */
class DxtFuelLetterFromManufacturerPage extends DxtFuelFormComponent {
  static SLUG = 'letter-from-manufacturer'

  static HEADING = 'Letter from manufacturer'

  //
  // ===== ACTIONS =====
  //

  async submit() {
    await this.verifyPageLoaded()
    await this.clickContinue()
  }

  //
  // ===== ASSERTIONS =====
  //

  // Heading and Continue are the only stable anchors - the page has no form fields
  async verifyPageLoaded() {
    await super.verifyPageLoaded(DxtFuelLetterFromManufacturerPage.HEADING)
    await expect(this.continueButton).toBeDisplayed()
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return super.open(DxtFuelLetterFromManufacturerPage.SLUG)
  }
}

export default new DxtFuelLetterFromManufacturerPage()
