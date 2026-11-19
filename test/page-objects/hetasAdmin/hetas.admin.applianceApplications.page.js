import pageNavigation from './pageNavigation.component.js'
import ApplicationsTableComponent from './applicationsTable.component.js'

/**
 * Appliance applications - reached from the HETAS admin dashboard by clicking
 * "New applications" under the "Manage appliances" section. "In progress
 * applications" on the same dashboard section links to this same page.
 */
class ApplianceApplicationsPage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  // Lazily created so each call re-queries the current DOM, per status group
  get notStartedTable() {
    return new ApplicationsTableComponent('Not started')
  }

  get inProgressTable() {
    return new ApplicationsTableComponent('In progress')
  }

  //
  // ===== ACTIONS =====
  //

  async startReview(applicationReference) {
    await this.notStartedTable.reviewApplication(applicationReference)
  }

  async continueReview(applicationReference) {
    await this.inProgressTable.reviewApplication(applicationReference)
  }

  async getReviewer(applicationReference) {
    return this.inProgressTable.getReviewer(applicationReference)
  }

  async getNotStartedProducts(applicationReference) {
    return this.notStartedTable.getProductsForApplication(applicationReference)
  }

  // A submitted application reaches this list asynchronously, so reload until its product
  // shows in "Not started", then return the reference it was given
  async waitForApplicationAwaitingReview(productName, timeout = 1800000) {
    await browser.waitUntil(
      async () => {
        if (await this.notStartedTable.hasProduct(productName)) {
          return true
        }
        await browser.refresh()
        return false
      },
      {
        timeout,
        interval: 3000,
        timeoutMsg: `No application for "${productName}" appeared under Not started within ${timeout}ms`
      }
    )

    return this.notStartedTable.getReferenceByProduct(productName)
  }

  async goToDashboard() {
    await pageNavigation.goToDashboard()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await expect(this.pageHeading).toHaveText('Appliance applications')
  }

  async verifyApplicationAwaitingReview(applicationReference) {
    await this.notStartedTable.verifyApplicationListed(applicationReference)
  }

  async verifyApplicationNotAwaitingReview(applicationReference) {
    await this.notStartedTable.verifyApplicationNotListed(applicationReference)
  }

  async verifyApplicationInProgress(applicationReference) {
    await this.inProgressTable.verifyApplicationListed(applicationReference)
  }

  async verifyApplicationNotInProgress(applicationReference) {
    await this.inProgressTable.verifyApplicationNotListed(applicationReference)
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return browser.url('/appliance-applications')
  }
}

export default new ApplianceApplicationsPage()
