import ApplicationReview from './hetas.admin.reviewApplianceApplication.page.js'

/**
 * "Review is not complete" - shown when Continue is selected while an appliance still has no
 * final decision (e.g. /incomplete-application-review/{reference}?type=appliance).
 */
class IncompleteApplicationReviewPage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  get message() {
    return $('p*=You must make a final decision')
  }

  get returnToApplicationReviewLink() {
    return $('a=Return to application review')
  }

  //
  // ===== ACTIONS =====
  //

  async returnToApplicationReview() {
    await this.returnToApplicationReviewLink.click()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await expect(this.pageHeading).toHaveText('Review is not complete')
  }

  async verifyFinalDecisionRequired() {
    await expect(this.message).toHaveText(
      'You must make a final decision on the appliance before completing your review.'
    )
  }

  async verifyReturnsToApplication(applicationReference) {
    await this.returnToApplicationReview()
    await ApplicationReview.verifyPageLoaded(applicationReference)
  }
}

export default new IncompleteApplicationReviewPage()
