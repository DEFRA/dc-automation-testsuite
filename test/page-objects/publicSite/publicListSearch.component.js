export const RESULTS_LIST = '//ul[@class="govuk-list"]'

const SELECTED_FILTERS = '//div[@class="moj-filter__selected"]'

// Doubles as the results label and the selected-filters group heading
export const CERTIFIED_IN = 'Certified for use in:'

const SEARCH_TERM_GROUP = 'Search term:'

// Each filter tag starts with visually hidden link text that is part of its rendered text
const TAG_PREFIX = /^Remove this (search term|filter)\s*/

/**
 * Reusable public list search page (appliance list / fuel list), which share the same intro,
 * keyword search, country filter, selected-filters panel, results list and pagination, and only
 * differ in their heading, form actions and the labelled paragraphs inside each result.
 *
 * Results are an unordered list rather than a table, and every result carries its own values,
 * so results are located by name and their values read off the labelled paragraphs within that
 * list item.
 */
class PublicListSearchComponent {
  constructor({ heading, searchFormAction, filterFormAction, path }) {
    this.heading = heading
    this.searchFormAction = searchFormAction
    this.filterFormAction = filterFormAction
    this.path = path
  }

  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  get defraLink() {
    return $('a[href*="department-for-environment-food-rural-affairs"]')
  }

  get smokeControlAreasLink() {
    return $('a[href*="smoke-control"]')
  }

  get welshLanguageLink() {
    return $('.hmrc-service-navigation-language-select a[hreflang="cy"]')
  }

  // Search
  get searchInput() {
    return $('#keywords')
  }

  // Both forms use the same data-test-id, so each button is scoped to its form
  get searchButton() {
    return $(
      `form[action="${this.searchFormAction}"] [data-test-id="submit-button"]`
    )
  }

  // Country filter
  get applyFilterButton() {
    return $(
      `form[action="${this.filterFormAction}"] [data-test-id="submit-button"]`
    )
  }

  // Selected search and filters - only rendered once a search or filter has been applied
  get selectedFiltersPanel() {
    return $(SELECTED_FILTERS)
  }

  get clearSearchAndFiltersLink() {
    return $('=Clear search and filters')
  }

  // Results
  get resultsCountText() {
    return $('//p[starts-with(normalize-space(), "Showing ")]')
  }

  // The intro bullet list also uses govuk-list, so the results list is matched on the exact class
  get resultItems() {
    return $$(`${RESULTS_LIST}/li`)
  }

  get resultNameLinks() {
    return $$(`${RESULTS_LIST}/li/h3/a`)
  }

  // Pagination
  get nextPageLink() {
    return $('.govuk-pagination__next a')
  }

  get previousPageLink() {
    return $('.govuk-pagination__prev a')
  }

  get currentPageLink() {
    return $('.govuk-pagination__item--current a')
  }

  //
  // ===== HELPERS =====
  //

  // The Scotland checkbox value is misspelled in the prototype ("Sctoland"), so the checkboxes
  // are matched on their visible label instead of their value
  getCountryFilterCheckbox(country) {
    return $(
      `//input[@name="countryCert"][following-sibling::label[normalize-space()="${country}"]]`
    )
  }

  getPageLink(pageNumber) {
    return $(`.govuk-pagination__link[aria-label="Page ${pageNumber}"]`)
  }

  // Tags sit in the ul immediately following their group heading
  getSelectedFilterTags(groupHeading) {
    return $$(
      `${SELECTED_FILTERS}//h3[normalize-space()="${groupHeading}"]/following-sibling::ul[contains(@class, "moj-filter-tags")][1]/li/a`
    )
  }

  async getSelectedFilterTagTexts(groupHeading) {
    const tags = await this.getSelectedFilterTags(groupHeading)
    return Promise.all(
      tags.map(async (tag) =>
        (await tag.getText()).trim().replace(TAG_PREFIX, '').trim()
      )
    )
  }

  async getSelectedFilterTag(groupHeading, value) {
    const tags = await this.getSelectedFilterTags(groupHeading)
    const texts = await this.getSelectedFilterTagTexts(groupHeading)
    return tags[texts.indexOf(value)]
  }

  getResultItem(name) {
    return $(`${RESULTS_LIST}/li[.//h3/a[normalize-space()="${name}"]]`)
  }

  // Values are rendered as labelled paragraphs, not a definition list, so the value is read by
  // stripping the label prefix
  async readResultValue(item, label) {
    const paragraph = await item.$(
      `.//p[starts-with(normalize-space(), "${label}")]`
    )
    const text = (await paragraph.getText()).trim()
    return text
      .slice(label.length)
      .replace(/^[:\s]+/, '')
      .trim()
  }

  async readCommaSeparatedResultValue(item, label) {
    const value = await this.readResultValue(item, label)
    return value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  }

  async readCertifiedIn(item) {
    return this.readCommaSeparatedResultValue(item, CERTIFIED_IN)
  }

  async getResultValue(name, label) {
    return this.readResultValue(await this.getResultItem(name), label)
  }

  async getCommaSeparatedResultValue(name, label) {
    return this.readCommaSeparatedResultValue(
      await this.getResultItem(name),
      label
    )
  }

  //
  // ===== ACTIONS =====
  //

  async search(keywords) {
    await this.searchInput.setValue(keywords)
    await this.searchButton.click()
  }

  async filterByCountry(...countries) {
    for (const country of countries) {
      await this.getCountryFilterCheckbox(country).click()
    }
    await this.applyFilterButton.click()
  }

  async removeSelectedFilter(groupHeading, value) {
    const tag = await this.getSelectedFilterTag(groupHeading, value)
    await tag.click()
  }

  async clearSearchAndFilters() {
    await this.clearSearchAndFiltersLink.click()
  }

  async openResult(name) {
    const item = await this.getResultItem(name)
    await item.$('h3 a').click()
  }

  async goToNextPage() {
    await this.nextPageLink.click()
  }

  async goToPreviousPage() {
    await this.previousPageLink.click()
  }

  async goToPage(pageNumber) {
    await this.getPageLink(pageNumber).click()
  }

  async getCertifiedIn(name) {
    return this.readCertifiedIn(await this.getResultItem(name))
  }

  async getResultNames() {
    const links = await this.resultNameLinks
    return Promise.all(links.map(async (link) => (await link.getText()).trim()))
  }

  // The search box keeps the submitted keywords after a search or filter
  async getSearchTerm() {
    return (await this.searchInput.getValue()).trim()
  }

  async getSelectedSearchTerms() {
    return this.getSelectedFilterTagTexts(SEARCH_TERM_GROUP)
  }

  async getSelectedCountryFilters() {
    return this.getSelectedFilterTagTexts(CERTIFIED_IN)
  }

  async isCountryFilterChecked(country) {
    return this.getCountryFilterCheckbox(country).isSelected()
  }

  async getResultsCount() {
    const text = await this.resultsCountText.getText()
    const [, from, to, total] = text.match(
      /Showing\s+([\d,]+)\s+to\s+([\d,]+)\s+of\s+([\d,]+)/
    )
    const toNumber = (value) => Number(value.replace(/,/g, ''))
    return { from: toNumber(from), to: toNumber(to), total: toNumber(total) }
  }

  async getCurrentPageNumber() {
    return Number((await this.currentPageLink.getText()).trim())
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await expect(this.pageHeading).toHaveText(this.heading)
  }

  async verifyResultListed(name) {
    await expect(this.getResultItem(name)).toBeDisplayed()
  }

  async verifyResultNotListed(name) {
    await expect(this.getResultItem(name)).not.toExist()
  }

  /**
   * @param {{searchTerm?: string, certifiedIn?: string[]}} expected
   */
  async verifySelectedFilters(expected) {
    await expect(this.selectedFiltersPanel).toBeDisplayed()

    if (expected.searchTerm) {
      expect(await this.getSelectedSearchTerms()).toEqual([expected.searchTerm])
      expect(await this.getSearchTerm()).toEqual(expected.searchTerm)
    }
    if (expected.certifiedIn) {
      expect(await this.getSelectedCountryFilters()).toEqual(
        expected.certifiedIn
      )
      for (const country of expected.certifiedIn) {
        expect(await this.isCountryFilterChecked(country)).toBe(true)
      }
    }
  }

  async verifyNoSelectedFilters() {
    await expect(this.selectedFiltersPanel).not.toExist()
  }

  // The number of rows rendered should match the "Showing x to y" range
  async verifyResultsCountMatchesListed() {
    const { from, to } = await this.getResultsCount()
    const items = await this.resultItems
    expect(items).toHaveLength(to - from + 1)
  }

  async verifyAllResultsMatchKeyword(keyword) {
    const names = await this.getResultNames()
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) {
      expect(name.toLowerCase()).toContain(keyword.toLowerCase())
    }
  }

  async verifyAllResultsCertifiedIn(country) {
    const items = await this.resultItems
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(await this.readCertifiedIn(item)).toContain(country)
    }
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return browser.url(this.path)
  }
}

export default PublicListSearchComponent
