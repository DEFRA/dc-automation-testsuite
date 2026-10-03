import DxtApplianceFormComponent from './dxtApplianceForm.component.js'

/**
 * DXT appliance form - "Form submitted" confirmation.
 *
 * The form issues no application reference here, so created records can only be found again by
 * the values they were submitted with (company name, model name).
 */
class DxtApplianceFormSubmittedPage extends DxtApplianceFormComponent {
  static PATH =
    '/form/preview/draft/get-a-stove-or-other-appliance-certified-for-use-in-smoke-control-areas/status'

  static HEADING = 'Form submitted'

  //
  // ===== SELECTORS =====
  //

  get confirmationPanel() {
    return $('.govuk-panel--confirmation')
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await super.verifyPageLoaded(DxtApplianceFormSubmittedPage.HEADING)
    await expect(this.confirmationPanel).toBeDisplayed()
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return this.openPath(DxtApplianceFormSubmittedPage.PATH)
  }
}

export default new DxtApplianceFormSubmittedPage()
