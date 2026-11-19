/**
 * Review complete - shown after "Submit for approval" on the appliance review outcome page
 * (e.g. /1083/review-complete).
 */
class ReviewApplianceCompletePage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  get confirmationMessage() {
    return $('p*=Your review of application')
  }

  get returnToApplianceApplicationsLink() {
    return $('a=Return to appliance applications')
  }

  get goToApplianceRecordsLink() {
    return $('a=Go to appliance records')
  }

  get returnToDashboardLink() {
    return $('a=Return to dashboard')
  }

  //
  // ===== ACTIONS =====
  //

  async returnToApplianceApplications() {
    await this.returnToApplianceApplicationsLink.click()
  }

  async goToApplianceRecords() {
    await this.goToApplianceRecordsLink.click()
  }

  async returnToDashboard() {
    await this.returnToDashboardLink.click()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded(applicationReference) {
    await expect(this.pageHeading).toHaveText('Review complete')
    await expect(this.confirmationMessage).toHaveText(
      `Your review of application ${applicationReference} is complete.`
    )
  }

  //
  // ===== NAVIGATION =====
  //

  open(applicationReference) {
    return browser.url(
      `/admin/iteration-2/${applicationReference}/review-complete`
    )
  }
}

export default new ReviewApplianceCompletePage()
