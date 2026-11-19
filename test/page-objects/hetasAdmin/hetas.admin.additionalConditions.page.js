/**
 * Enter additional conditions for {appliance} - reached via the "Enter
 * additional conditions" task on the appliance review detail page
 * (e.g. /1083/CS200i/additional-conditions). The page heading is a GOV.UK
 * label-wrapper, not a plain heading - the text also labels the textarea.
 */
class AdditionalConditionsPage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  get additionalConditionsTextarea() {
    return $('#additionalConditions')
  }

  get saveAndMarkAsCompletedButton() {
    return $('button=Save and mark as completed')
  }

  get cancelLink() {
    return $('a=Cancel')
  }

  //
  // ===== ACTIONS =====
  //

  async enterAdditionalConditions(text) {
    await this.additionalConditionsTextarea.setValue(text)
  }

  async saveAndMarkAsCompleted() {
    await this.saveAndMarkAsCompletedButton.click()
  }

  async cancel() {
    await this.cancelLink.click()
  }

  //
  // ===== ASSERTIONS =====
  //

  // The live admin's heading breaks the line before "for {appliance}"
  async verifyPageLoaded(applianceName) {
    await expect(this.pageHeading).toHaveText(
      `Enter additional conditions for ${applianceName}`,
      { replace: [/\s+/g, ' '] }
    )
  }

  async getAdditionalConditions() {
    return this.additionalConditionsTextarea.getValue()
  }

  //
  // ===== NAVIGATION =====
  //

  open(applicationReference, applianceCode) {
    return browser.url(
      `/admin/iteration-2/${applicationReference}/${applianceCode}/additional-conditions`
    )
  }
}

export default new AdditionalConditionsPage()
