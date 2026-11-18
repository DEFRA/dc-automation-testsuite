/**
 * Reusable breadcrumb + back-link navigation shared across HETAS admin content pages.
 */
class PageNavigationComponent {
  //
  // ===== SELECTORS =====
  //

  // Only the "Home" crumb links somewhere real; the current-page crumb shares the same
  // class but points to "#", so the href is required to disambiguate the two.
  get homeBreadcrumbLink() {
    return $(
      'a.govuk-breadcrumbs__link[href*="dashboard"], a.govuk-breadcrumbs__link[href*="manage-certification"]'
    )
  }

  // Unique GOV.UK Frontend component class
  get backLink() {
    return $('.govuk-back-link')
  }

  //
  // ===== ACTIONS =====
  //

  async goToDashboard() {
    await this.homeBreadcrumbLink.click()
  }

  async goBack() {
    await this.backLink.click()
  }
}

export default new PageNavigationComponent()
