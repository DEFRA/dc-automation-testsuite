/**
 * Reusable GOV.UK table component for one application status group (e.g. "Not
 * started", "In progress"). Shared by the appliance and fuel application pages,
 * which render the same table structure. Rows have no test attribute, so each
 * row is looked up by its application reference - the only stable per-row
 * identity in the DOM.
 */
class ApplicationsTableComponent {
  constructor(captionText) {
    this.captionText = captionText
  }

  //
  // ===== SELECTORS =====
  //

  // The prototype captions each table; the live admin puts the status in a heading above it
  get table() {
    return $(
      `//table[.//caption[normalize-space(text())="${this.captionText}"]] | //h2[normalize-space(text())="${this.captionText}"]/following-sibling::table[1]`
    )
  }

  //
  // ===== HELPERS =====
  //

  // The reference is the first cell of its row (a th in the prototype, a td in the live admin)
  async getRow(applicationReference) {
    return this.table.$(
      `.//tr[*[1][normalize-space(.)="${applicationReference}"]]`
    )
  }

  // Cells in order: reference, products, then reviewer (when present) and the action
  async getCells(applicationReference) {
    const row = await this.getRow(applicationReference)
    return row.$$('th, td')
  }

  //
  // ===== ACTIONS =====
  //

  async getProductsForApplication(applicationReference) {
    const cells = await this.getCells(applicationReference)
    return (await cells[1].getText()).trim()
  }

  // Submission returns no reference number, so a new application is found by its product name
  async hasProduct(productText) {
    const row = await this.table.$(
      `.//tr[*[2][contains(normalize-space(.), "${productText}")]]`
    )
    return row.isExisting()
  }

  async getReferenceByProduct(productText) {
    const reference = await this.table.$(
      `.//tr[*[2][contains(normalize-space(.), "${productText}")]]/*[1]`
    )
    return (await reference.getText()).trim()
  }

  // Only present on tables with a "Reviewer" column (e.g. "In progress")
  async getReviewer(applicationReference) {
    const cells = await this.getCells(applicationReference)
    return (await cells[2].getText()).trim()
  }

  // "Start review" is a button and "Continue review" a link, so either control is clicked
  async reviewApplication(applicationReference) {
    const row = await this.getRow(applicationReference)
    await row.$('a, button').click()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyApplicationListed(applicationReference) {
    await expect(await this.getRow(applicationReference)).toBeDisplayed()
  }

  async verifyApplicationNotListed(applicationReference) {
    await expect(await this.getRow(applicationReference)).not.toExist()
  }
}

export default ApplicationsTableComponent
