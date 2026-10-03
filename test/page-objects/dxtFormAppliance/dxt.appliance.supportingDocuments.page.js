import DxtApplianceFormComponent from './dxtApplianceForm.component.js'

/**
 * DXT appliance form - "Supporting documents".
 *
 * Information only: the documents are emailed to HETAS separately, so there is nothing to
 * enter or upload here.
 */
class DxtApplianceSupportingDocumentsPage extends DxtApplianceFormComponent {
  static PATH =
    '/form/preview/draft/get-a-stove-or-other-appliance-certified-for-use-in-smoke-control-areas/supporting-documents'

  static HEADING = 'Supporting documents'

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

  async verifyPageLoaded() {
    await super.verifyPageLoaded(DxtApplianceSupportingDocumentsPage.HEADING)
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return this.openPath(DxtApplianceSupportingDocumentsPage.PATH)
  }
}

export default new DxtApplianceSupportingDocumentsPage()
