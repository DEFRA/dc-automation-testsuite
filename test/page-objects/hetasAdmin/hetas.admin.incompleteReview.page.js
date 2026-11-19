/**
 * Shown when "Accept this appliance" is clicked before all review documentation
 * and public-listing tasks are completed - reached from the appliance review
 * detail page (e.g. /1083/CS200i/review-incomplete).
 */
class IncompleteReviewPage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  // Text includes the dynamic appliance name, so only the fixed prefix is matched
  get incompleteMessage() {
    return $('p*=You cannot accept')
  }

  // The link text carries the appliance name, so it is matched on its fixed prefix
  get returnToReviewLink() {
    return $('a*=Return to')
  }

  get blockingReasons() {
    return $$('main ul li')
  }

  //
  // ===== ACTIONS =====
  //

  async returnToReview() {
    await this.returnToReviewLink.click()
  }

  async getBlockingReasons() {
    const reasons = Array.from(await this.blockingReasons)
    return Promise.all(
      reasons.map(async (reason) => (await reason.getText()).trim())
    )
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await expect(this.pageHeading).toHaveText('Incomplete review')
  }

  async verifyApplianceCannotBeAccepted(applianceName) {
    await expect(this.incompleteMessage).toHaveText(applianceName, {
      containing: true
    })
  }

  //
  // ===== NAVIGATION =====
  //

  open(applicationReference, applianceCode) {
    return browser.url(
      `/admin/iteration-2/${applicationReference}/${applianceCode}/review-incomplete`
    )
  }
}

export default new IncompleteReviewPage()
