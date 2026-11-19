/**
 * Devolved admin alternate path - action history page.
 * Reached from the appliance record detail page's "Action history" > View link.
 */
class DevolvedAdminAltActionHistoryPage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  // Scopes to the action history table via its (visually hidden) caption
  get table() {
    return $('//table[.//caption[normalize-space(text())="Action history"]]')
  }

  get returnToRecordLink() {
    return $('=Return to record')
  }

  //
  // ===== HELPERS =====
  //

  // The action is the first cell of its row (a td scope="row" in the prototype, a plain td live)
  async getRow(action) {
    return this.table.$(`.//tr[td[1][normalize-space(.)="${action}"]]`)
  }

  //
  // ===== ACTIONS =====
  //

  async returnToRecord() {
    await this.returnToRecordLink.click()
  }

  async getCompletedBy(action) {
    const row = await this.getRow(action)
    const cells = await row.$$('td')
    return (await cells[1].getText()).trim()
  }

  async getActionDate(action) {
    const row = await this.getRow(action)
    const cells = await row.$$('td')
    return (await cells[2].getText()).trim()
  }

  //
  // ===== ASSERTIONS =====
  //

  // Heading includes the appliance name, so this is parameterized rather than a fixed string
  async verifyPageLoaded(applianceName) {
    await expect(this.pageHeading).toHaveText(
      `Action history for ${applianceName}`
    )
  }

  async verifyActionListed(action) {
    await expect(await this.getRow(action)).toBeDisplayed()
  }
}

export default new DevolvedAdminAltActionHistoryPage()
