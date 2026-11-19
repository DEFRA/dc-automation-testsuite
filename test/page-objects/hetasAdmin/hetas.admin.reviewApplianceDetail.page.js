import taskList from './taskList.component.js'

/**
 * Review a specific appliance within an appliance application - reached by
 * clicking "Start review" against an appliance row on the application review
 * page (e.g. /1083/CS200i/review-appliance). Note: in the supplied DOM the
 * final breadcrumb text does not match this page's own heading, so it is not
 * used here to identify the current appliance - see flaky-area notes.
 */
class ReviewApplianceDetailPage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  // The control reads "Accept this appliance" while tasks are incomplete and "Accept appliance"
  // after, and is a link in the prototype but a button in the live admin
  get acceptApplianceButton() {
    return $(
      '//*[self::a or self::button][starts-with(normalize-space(.), "Accept")]'
    )
  }

  get rejectApplianceButton() {
    return $(
      '//*[self::a or self::button][normalize-space(.)="Reject appliance"]'
    )
  }

  get saveAndComeBackLaterLink() {
    return $('a=Save and come back later')
  }

  //
  // ===== ACTIONS =====
  //

  async getTaskStatus(taskName) {
    return taskList.getTaskStatus(taskName)
  }

  async openTask(taskName) {
    await taskList.openTask(taskName)
  }

  async acceptAppliance() {
    await this.acceptApplianceButton.click()
  }

  async rejectAppliance() {
    await this.rejectApplianceButton.click()
  }

  async saveAndComeBackLater() {
    await this.saveAndComeBackLaterLink.click()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded(applianceName) {
    await expect(this.pageHeading).toHaveText(`Review ${applianceName}`)
  }

  //
  // ===== NAVIGATION =====
  //

  open(applicationReference, applianceCode) {
    return browser.url(
      `/admin/iteration-2/${applicationReference}/${applianceCode}/review-appliance`
    )
  }
}

export default new ReviewApplianceDetailPage()
