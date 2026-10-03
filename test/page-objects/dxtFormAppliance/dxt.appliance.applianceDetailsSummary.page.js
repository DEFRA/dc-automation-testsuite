import DxtApplianceFormComponent from './dxtApplianceForm.component.js'

/**
 * DXT appliance form - "You have added N answers", the summary of the repeatable
 * appliance details section.
 */
class DxtApplianceApplianceDetailsSummaryPage extends DxtApplianceFormComponent {
  static PATH =
    '/form/preview/draft/get-a-stove-or-other-appliance-certified-for-use-in-smoke-control-areas/appliance-details/summary'

  // Heading counts the appliances added so far, so it is matched as a pattern
  static HEADING_PATTERN = /^You have added \d+ answers?$/

  //
  // ===== SELECTORS =====
  //

  get summaryList() {
    return $('.govuk-summary-list')
  }

  get rows() {
    return this.summaryList.$$('.govuk-summary-list__row')
  }

  // Unlike other pages, every button here carries name="action", so the base Continue
  // selector (which relies on Continue having no name) does not apply
  get continueButton() {
    return $('button[name="action"][value="continue"]')
  }

  get addAnotherButton() {
    return $('button[name="action"][value="add-another"]')
  }

  //
  // ===== HELPERS =====
  //

  getRow(applianceNumber) {
    return $(
      `//div[contains(@class,"govuk-summary-list__row")][dt[normalize-space(.)="Appliance ${applianceNumber}"]]`
    )
  }

  // Action links carry a visually hidden " item N" suffix. "Remove" is absent when only one
  // appliance is listed, as an application must keep at least one.
  getRowAction(applianceNumber, actionName) {
    return this.getRow(applianceNumber).$(
      `.//a[starts-with(normalize-space(.),"${actionName}")]`
    )
  }

  //
  // ===== ACTIONS =====
  //

  async addAnother() {
    await this.addAnotherButton.click()
  }

  async change(applianceNumber) {
    await this.getRowAction(applianceNumber, 'Change').click()
  }

  async remove(applianceNumber) {
    await this.getRowAction(applianceNumber, 'Remove').click()
  }

  async getModelName(applianceNumber) {
    const value = await this.getRow(applianceNumber)
      .$('.govuk-summary-list__value')
      .getText()
    return value.trim()
  }

  // The appliance's generated id, taken from its Change link - the only place it is exposed
  async getApplianceId(applianceNumber) {
    const href = await this.getRowAction(
      applianceNumber,
      'Change'
    ).getAttribute('href')
    return href.match(/appliance-details\/([0-9a-f-]{36})/)[1]
  }

  async getApplianceCount() {
    return (await this.rows).length
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await super.verifyPageLoaded(
      DxtApplianceApplianceDetailsSummaryPage.HEADING_PATTERN
    )
  }

  async verifyApplianceListed(applianceNumber, modelName) {
    await expect(
      this.getRow(applianceNumber).$('.govuk-summary-list__value')
    ).toHaveText(modelName)
  }

  async verifyApplianceCount(expectedCount) {
    await expect(this.rows).toBeElementsArrayOfSize(expectedCount)
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return this.openPath(DxtApplianceApplianceDetailsSummaryPage.PATH)
  }
}

export default new DxtApplianceApplianceDetailsSummaryPage()
