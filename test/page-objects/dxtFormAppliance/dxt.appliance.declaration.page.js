import DxtApplianceFormComponent from './dxtApplianceForm.component.js'

/**
 * DXT appliance form - "Declaration".
 */
class DxtApplianceDeclarationPage extends DxtApplianceFormComponent {
  static PATH =
    '/form/preview/draft/get-a-stove-or-other-appliance-certified-for-use-in-smoke-control-areas/declaration'

  static HEADING = 'Declaration'

  //
  // ===== SELECTORS =====
  //

  // I understand and agree. Matched by id, as a hidden input shares the name "tiRhSf"
  get agreeCheckbox() {
    return $('#tiRhSf')
  }

  //
  // ===== ACTIONS =====
  //

  // Clicking toggles, so re-entering the page must not un-tick an already agreed declaration
  async agree() {
    if (!(await this.agreeCheckbox.isSelected())) {
      await this.agreeCheckbox.click()
    }
  }

  async submit() {
    await this.verifyPageLoaded()
    await this.agree()
    await this.clickContinue()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await super.verifyPageLoaded(DxtApplianceDeclarationPage.HEADING)
    await expect(this.agreeCheckbox).toExist()
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return this.openPath(DxtApplianceDeclarationPage.PATH)
  }
}

export default new DxtApplianceDeclarationPage()
