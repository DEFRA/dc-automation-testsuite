import pageNavigation from './pageNavigation.component.js'
import SummaryListComponent from './summaryList.component.js'
import ReviewItemsTableComponent from './reviewItemsTable.component.js'

/**
 * Review appliance application {reference} - reached by clicking "Start review",
 * "Continue review" or "Edit review" against a row on the appliance applications
 * page (Not started / In progress / Accepted respectively). The application
 * reference in the URL/heading matches the one shown there (e.g. 1083, 1084).
 */
class ReviewApplianceApplicationPage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  get applicantDetails() {
    return new SummaryListComponent('Applicant details')
  }

  get applianceForReview() {
    return new ReviewItemsTableComponent('Appliances for review')
  }

  // Only button on the page today; see flaky-area notes if more are added
  get continueButton() {
    return $('a=Continue')
  }

  get comeBackLaterLink() {
    return $('a=Come back to this later')
  }

  //
  // ===== ACTIONS =====
  //

  async getApplicantDetail(label) {
    return this.applicantDetails.getValue(label)
  }

  async getApplianceStatus(applianceName) {
    return this.applianceForReview.getStatus(applianceName)
  }

  // The full name as shown here, found from the part the test controls (e.g. the model name)
  async getApplianceName(partialName) {
    return this.applianceForReview.findItemName(partialName)
  }

  async getApplianceNames() {
    return this.applianceForReview.getItemNames()
  }

  async getApplianceActionLabel(applianceName) {
    return this.applianceForReview.getActionLabel(applianceName)
  }

  // Action link text is "Start review", "Continue review" or "Edit review"
  // depending on status, but all three click the same row link
  async startApplianceReview(applianceName) {
    await this.applianceForReview.reviewItem(applianceName)
  }

  async continueApplianceReview(applianceName) {
    await this.applianceForReview.reviewItem(applianceName)
  }

  async editApplianceReview(applianceName) {
    await this.applianceForReview.reviewItem(applianceName)
  }

  async continueToNextStep() {
    await this.continueButton.click()
  }

  async comeBackLater() {
    await this.comeBackLaterLink.click()
  }

  async goToDashboard() {
    await pageNavigation.goToDashboard()
  }

  //
  // ===== ASSERTIONS =====
  //

  // The reference sits on its own line in the live admin's heading
  async verifyPageLoaded(applicationReference) {
    await expect(this.pageHeading).toHaveText(
      `Review appliance application ${applicationReference}`,
      { replace: [/\s+/g, ' '] }
    )
  }

  //
  // ===== NAVIGATION =====
  //

  open(applicationReference) {
    return browser.url(
      `/admin/iteration-2/${applicationReference}/review-application`
    )
  }
}

export default new ReviewApplianceApplicationPage()
