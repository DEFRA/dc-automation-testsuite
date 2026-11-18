import adminHeader from './adminHeader.component.js'

/**
 * HETAS admin dashboard - "Manage smoke control certification".
 * Entry point for navigating to appliance/fuel applications and records.
 */
class HetasAdminDashboardPage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  get appliancesSectionHeading() {
    return $('h2=Manage appliances')
  }

  get fuelsSectionHeading() {
    return $('h2=Manage fuels')
  }

  // href is unique on the page for this link
  get applianceRecordsLink() {
    return $('a[href="/appliance-records"]')
  }

  // href is unique on the page for this link
  get fuelRecordsLink() {
    return $('a[href*="records-fuels"]')
  }

  // Temporary locator: "New applications" and "In progress applications" share the same
  // href within the appliances section, so both the href and the exact text are required
  // to identify each link uniquely. See recommendations for a data-testid fix.
  get newApplianceApplicationsLink() {
    return $(
      '//a[@href="/appliance-applications" and text()="New applications"]'
    )
  }

  get inProgressApplianceApplicationsLink() {
    return $(
      '//a[@href="/appliance-applications" and text()="In progress applications"]'
    )
  }

  // Temporary locator: same duplicate-href issue as above, scoped to the fuels section.
  get newFuelApplicationsLink() {
    return $(
      '//a[@href="applications-fuels.html" and text()="New applications"]'
    )
  }

  get inProgressFuelApplicationsLink() {
    return $(
      '//a[@href="applications-fuels.html" and text()="In progress applications"]'
    )
  }

  // Temporary locator: the count has no test attribute of its own, so it is found via the
  // paragraph immediately preceding its already-anchored link. See recommendations for a
  // data-testid fix on the count element itself.
  get applianceNewApplicationsCount() {
    return $(
      '//a[@href="/appliance-applications" and text()="New applications"]/preceding-sibling::p[1]'
    )
  }

  get applianceInProgressApplicationsCount() {
    return $(
      '//a[@href="/appliance-applications" and text()="In progress applications"]/preceding-sibling::p[1]'
    )
  }

  get applianceRecordsCount() {
    return $('//a[@href="/appliance-records"]/preceding-sibling::p[1]')
  }

  get fuelNewApplicationsCount() {
    return $(
      '//a[@href="applications-fuels.html" and text()="New applications"]/parent::p/preceding-sibling::p[1]'
    )
  }

  get fuelInProgressApplicationsCount() {
    return $(
      '//a[@href="applications-fuels.html" and text()="In progress applications"]/parent::p/preceding-sibling::p[1]'
    )
  }

  get fuelRecordsCount() {
    return $(
      '//a[@href="records-fuels.html"]/parent::p/preceding-sibling::p[1]'
    )
  }

  //
  // ===== ACTIONS =====
  //

  async goToApplianceRecords() {
    await this.applianceRecordsLink.click()
  }

  async goToFuelRecords() {
    await this.fuelRecordsLink.click()
  }

  async goToNewApplianceApplications() {
    await this.newApplianceApplicationsLink.click()
  }

  async goToInProgressApplianceApplications() {
    await this.inProgressApplianceApplicationsLink.click()
  }

  async goToNewFuelApplications() {
    await this.newFuelApplicationsLink.click()
  }

  async goToInProgressFuelApplications() {
    await this.inProgressFuelApplicationsLink.click()
  }

  async signOut() {
    await adminHeader.signOut()
  }

  async getApplianceNewApplicationsCount() {
    return (await this.applianceNewApplicationsCount.getText()).trim()
  }

  async getApplianceInProgressApplicationsCount() {
    return (await this.applianceInProgressApplicationsCount.getText()).trim()
  }

  async getApplianceRecordsCount() {
    return (await this.applianceRecordsCount.getText()).trim()
  }

  async getFuelNewApplicationsCount() {
    return (await this.fuelNewApplicationsCount.getText()).trim()
  }

  async getFuelInProgressApplicationsCount() {
    return (await this.fuelInProgressApplicationsCount.getText()).trim()
  }

  async getFuelRecordsCount() {
    return (await this.fuelRecordsCount.getText()).trim()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await expect(this.pageHeading).toHaveText(
      'Manage smoke control certification'
    )
  }

  async verifyAppliancesSectionLoaded() {
    await expect(this.appliancesSectionHeading).toBeDisplayed()
  }

  async verifyFuelsSectionLoaded() {
    await expect(this.fuelsSectionHeading).toBeDisplayed()
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return browser.url('/manage-certification')
  }
}

export default new HetasAdminDashboardPage()
