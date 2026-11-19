/**
 * Finish application review - reached by clicking "Continue" on the review application page
 * once every appliance has been accepted or rejected (e.g. /1083/review-outcome). The wording
 * and the action depend on the decisions: this page object covers the all-accepted variant,
 * which offers "Submit for approval".
 */
class ReviewApplianceOutcomePage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  // Only list inside main - it holds the appliances considered suitable
  get suitableAppliancesList() {
    return $('main ul')
  }

  // Wording varies between one and several appliances, so only the shared part is matched
  get governmentsMessage() {
    return $('p*=submitted to the governments')
  }

  get submitForApprovalLink() {
    return $(
      '//*[self::a or self::button][normalize-space(.)="Submit for approval"]'
    )
  }

  get returnToApplicationReviewLink() {
    return $('a=Return to application review')
  }

  //
  // ===== ACTIONS =====
  //

  async submitForApproval() {
    await this.submitForApprovalLink.click()
  }

  async returnToApplicationReview() {
    await this.returnToApplicationReviewLink.click()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await expect(this.pageHeading).toHaveText('Finish Application Review')
  }

  async verifyApplianceSuitable(applianceName) {
    await expect(this.suitableAppliancesList).toHaveText(applianceName, {
      containing: true
    })
  }

  async verifyReadyForGovernmentApproval() {
    await expect(this.governmentsMessage).toHaveText(
      'England, Scotland, Wales and Northern Ireland',
      { containing: true }
    )
    await expect(this.submitForApprovalLink).toBeDisplayed()
  }

  //
  // ===== NAVIGATION =====
  //

  open(applicationReference) {
    return browser.url(
      `/admin/iteration-2/${applicationReference}/review-outcome`
    )
  }
}

export default new ReviewApplianceOutcomePage()
