/**
 * Reusable records list page (Appliance records / Fuel records / ...), which share the same
 * search + status filter + table + pagination structure and only differ in table caption/heading.
 */
class RecordsListComponent {
  constructor(tableCaption) {
    this.tableCaption = tableCaption
  }

  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  get backLink() {
    return $('.govuk-back-link')
  }

  get searchInput() {
    return $('#keywords')
  }

  get searchSubmitButton() {
    return $('form button[type="submit"]')
  }

  // Only paragraph directly preceding the table
  get recordsCountText() {
    return $('//table/preceding-sibling::p[1]')
  }

  // The live admin's records table has no caption, and it is the only table on the page
  get table() {
    return $('main table')
  }

  get nextPageLink() {
    return $('.govuk-pagination__next a')
  }

  //
  // ===== HELPERS =====
  //

  // Checkbox ids are positional (filter, filter-1, filter-2...), so lookup is by value instead
  getStatusFilterCheckbox(status) {
    return $(`input[name="filters"][value="${status}"]`)
  }

  getPageLink(pageNumber) {
    return $(`.govuk-pagination__link[aria-label="Page ${pageNumber}"]`)
  }

  // Record ID is the first cell of its row
  async getRow(recordId) {
    return this.table.$(`.//tr[td[1][normalize-space(.)="${recordId}"]]`)
  }

  // New records are only known by the name they were submitted with, not by their record ID
  async getRowByName(name) {
    return this.table.$(`.//tr[td[contains(normalize-space(.), "${name}")]]`)
  }

  //
  // ===== ACTIONS =====
  //

  async search(keywords) {
    await this.searchInput.setValue(keywords)
    await this.searchSubmitButton.click()
  }

  async filterByStatus(status) {
    await this.getStatusFilterCheckbox(status).click()
  }

  async view(recordId) {
    const row = await this.getRow(recordId)
    await row.$('a').click()
  }

  async viewByName(name) {
    const row = await this.getRowByName(name)
    await row.$('a').click()
  }

  async countRowsByName(name) {
    const rows = await this.table.$$(
      `.//tr[td[contains(normalize-space(.), "${name}")]]`
    )
    return rows.length
  }

  async goToNextPage() {
    await this.nextPageLink.click()
  }

  async goToPage(pageNumber) {
    await this.getPageLink(pageNumber).click()
  }

  async goBack() {
    await this.backLink.click()
  }

  async getName(recordId) {
    const row = await this.getRow(recordId)
    const cells = await row.$$('td')
    return (await cells[1].getText()).trim()
  }

  async getStatus(recordId) {
    const row = await this.getRow(recordId)
    return (await row.$('.govuk-tag').getText()).trim()
  }

  async getRecordsCountText() {
    return (await this.recordsCountText.getText()).trim()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyRecordListed(recordId) {
    await expect(await this.getRow(recordId)).toBeDisplayed()
  }

  async verifyRecordListedByName(name) {
    await expect(await this.getRowByName(name)).toBeDisplayed()
  }

  async verifyStatusByName(name, expectedStatus) {
    const row = await this.getRowByName(name)
    await expect(row.$('.govuk-tag')).toHaveText(expectedStatus)
  }

  async verifyRecordNotListed(recordId) {
    await expect(await this.getRow(recordId)).not.toExist()
  }

  async verifyStatus(recordId, expectedStatus) {
    const row = await this.getRow(recordId)
    await expect(row.$('.govuk-tag')).toHaveText(expectedStatus)
  }
}

export default RecordsListComponent
