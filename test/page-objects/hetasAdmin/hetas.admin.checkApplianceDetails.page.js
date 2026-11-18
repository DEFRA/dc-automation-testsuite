import SummaryListComponent from './summaryList.component.js'

/**
 * Check appliance details for {appliance} - reached via the "Check appliance
 * details" task under "Prepare public listing" on the appliance review detail
 * page (e.g. /1083/CS200i/appliance-details). "Mark as completed" is a plain
 * link, not a form submission - there is no data entry on this page.
 */
class CheckApplianceDetailsPage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  // Summary list has no card wrapper on this page, so it is scoped to the whole page
  get applianceDetails() {
    return new SummaryListComponent()
  }

  // A link in the prototype, a form submit button in the live admin
  get markAsCompletedLink() {
    return $(
      '//*[self::a or self::button][normalize-space(.)="Mark as completed"]'
    )
  }

  get cancelLink() {
    return $('a=Cancel')
  }

  //
  // ===== ACTIONS =====
  //

  async getApplianceDetail(label) {
    return this.applianceDetails.getValue(label)
  }

  async changeApplianceDetail(label) {
    await this.applianceDetails.changeField(label)
  }

  async markAsCompleted() {
    await this.markAsCompletedLink.click()
  }

  async cancel() {
    await this.cancelLink.click()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded(applianceName) {
    await expect(this.pageHeading).toHaveText(
      `Check appliance details for ${applianceName}`
    )
  }

  //
  // ===== NAVIGATION =====
  //

  open(applicationReference, applianceCode) {
    return browser.url(
      `/admin/iteration-2/${applicationReference}/${applianceCode}/appliance-details`
    )
  }
}

export default new CheckApplianceDetailsPage()
