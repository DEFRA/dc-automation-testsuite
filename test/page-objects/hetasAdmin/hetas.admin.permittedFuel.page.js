/**
 * Check permitted fuel for {appliance} - reached via the "Check permitted
 * fuel" task under "Prepare public listing" on the appliance review detail
 * page (e.g. /1083/CS200i/permitted-fuel). The permitted fuels text and the
 * "burns wood" answer are both pre-populated from the application, so tests
 * should assert against the value they set rather than a fixed string.
 */
class PermittedFuelPage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  get permittedFuelsTextarea() {
    return $('#perm-fuels')
  }

  get burnsWoodYesRadio() {
    return $('#burnsWood')
  }

  get burnsWoodNoRadio() {
    return $('#burnsWood-2')
  }

  get markAsCompletedButton() {
    return $('button=Mark as completed')
  }

  get cancelLink() {
    return $('a=Cancel')
  }

  //
  // ===== ACTIONS =====
  //

  async enterPermittedFuels(text) {
    await this.permittedFuelsTextarea.setValue(text)
  }

  async markBurnsWoodYes() {
    await this.burnsWoodYesRadio.click()
  }

  async markBurnsWoodNo() {
    await this.burnsWoodNoRadio.click()
  }

  async markAsCompleted() {
    await this.markAsCompletedButton.click()
  }

  async cancel() {
    await this.cancelLink.click()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded(applianceName) {
    await expect(this.pageHeading).toHaveText(
      `Permitted fuels for ${applianceName}`
    )
  }

  async getPermittedFuels() {
    return this.permittedFuelsTextarea.getValue()
  }

  //
  // ===== NAVIGATION =====
  //

  open(applicationReference, applianceCode) {
    return browser.url(
      `/admin/iteration-2/${applicationReference}/${applianceCode}/permitted-fuel`
    )
  }
}

export default new PermittedFuelPage()
