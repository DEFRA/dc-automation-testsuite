const GUIDE_BODY =
  '//div[contains(@class, "govuk-prototype-kit-common-templates-mainstream-guide-body")]'

// Sections are flat siblings, so content is matched on its nearest preceding h2
const inSection = (heading) =>
  `[preceding-sibling::h2[1][normalize-space()="${heading}"]]`

/**
 * Public list - "Smoke control areas: the rules" guidance page, reached from the smoke control
 * areas link on the appliance and fuel lists.
 *
 * Static guidance with no forms, so content is located by section heading rather than by index.
 */
class SmokeControlPage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  get breadcrumbItems() {
    return $$('.govuk-breadcrumbs__list-item')
  }

  get currentBreadcrumb() {
    return $('.govuk-breadcrumbs__list-item[aria-current="page"]')
  }

  get sectionHeadings() {
    return $$(`${GUIDE_BODY}/h2[@id]`)
  }

  get authorisedFuelsLink() {
    return $(`${GUIDE_BODY}//a[contains(@href, "fuel-list")]`)
  }

  get exemptAppliancesLink() {
    return $(`${GUIDE_BODY}//a[contains(@href, "appliance-list")]`)
  }

  get localCouncilLink() {
    return $('=Contact your local council')
  }

  get bonfireRulesLink() {
    return $('=rules on bonfires')
  }

  get relatedContentLinks() {
    return $$('aside[role="complementary"] a')
  }

  get exploreTheTopicLinks() {
    return $$(`${GUIDE_BODY}//div[contains(@class, "related-items")]//a`)
  }

  //
  // ===== HELPERS =====
  //

  getSection(heading) {
    return $(`${GUIDE_BODY}/h2[normalize-space()="${heading}"]`)
  }

  getSectionBulletItems(heading) {
    return $$(`${GUIDE_BODY}/ul${inSection(heading)}/li`)
  }

  getSectionParagraphs(heading) {
    return $$(`${GUIDE_BODY}/p${inSection(heading)}`)
  }

  //
  // ===== ACTIONS =====
  //

  async getSectionHeadingTexts() {
    const headings = await this.sectionHeadings
    return Promise.all(headings.map(async (h) => (await h.getText()).trim()))
  }

  async getSectionAnchors() {
    const headings = await this.sectionHeadings
    return Promise.all(headings.map((h) => h.getAttribute('id')))
  }

  async getSectionBullets(heading) {
    const items = await this.getSectionBulletItems(heading)
    return Promise.all(items.map(async (item) => (await item.getText()).trim()))
  }

  async getBreadcrumbs() {
    const items = await this.breadcrumbItems
    return Promise.all(items.map(async (item) => (await item.getText()).trim()))
  }

  async getRelatedContent() {
    const links = await this.relatedContentLinks
    return Promise.all(links.map(async (link) => (await link.getText()).trim()))
  }

  async goToAuthorisedFuels() {
    await this.authorisedFuelsLink.click()
  }

  async goToExemptAppliances() {
    await this.exemptAppliancesLink.click()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await expect(this.pageHeading).toHaveText('Smoke control areas: the rules')
  }

  async verifyBreadcrumbs(expected) {
    expect(await this.getBreadcrumbs()).toEqual(expected)
  }

  async verifySectionListed(heading) {
    await expect(this.getSection(heading)).toBeDisplayed()
  }

  async verifySectionBullets(heading, expected) {
    expect(await this.getSectionBullets(heading)).toEqual(expected)
  }

  async verifyRelatedContent(expected) {
    expect(await this.getRelatedContent()).toEqual(expected)
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return browser.url('/public-list/iteration-2/smoke-control')
  }
}

export default new SmokeControlPage()
