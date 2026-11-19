/**
 * Review instruction manuals for {appliance} - reached via the "Review
 * instruction manual" task on the appliance review detail page
 * (e.g. /1083/CS200i/review-instruction-manual). Note: "Mark as failed" and
 * "Cancel" are plain links outside the <form>, so they do not submit the
 * entered manual details - only "Mark as passed" does.
 */
class ReviewInstructionManualPage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  get manualTitleInput() {
    return $('#title')
  }

  get includeVersionYesRadio() {
    return $('#includeVersion')
  }

  get includeVersionNoRadio() {
    return $('#includeVersion-2')
  }

  // Only present in the DOM once "Yes" is selected - a GOV.UK conditional reveal
  get versionInput() {
    return $('#version')
  }

  get publicationDayInput() {
    return $('#publicationDay')
  }

  get publicationMonthInput() {
    return $('#publicationMonth')
  }

  get publicationYearInput() {
    return $('#publicationYear')
  }

  get markAsPassedButton() {
    return $('button=Mark as passed')
  }

  get markAsFailedLink() {
    return $(
      '//*[self::a or self::button][normalize-space(.)="Mark as failed"]'
    )
  }

  get cancelLink() {
    return $('a=Cancel')
  }

  // Tells the reviewer which appliance's public listing the details are published to
  get publicListingNotice() {
    return $('p*=These details will be published')
  }

  //
  // ===== ACTIONS =====
  //

  async enterManualTitle(title) {
    await this.manualTitleInput.setValue(title)
  }

  // Selecting "Yes" reveals the version field; setValue's own auto-wait covers the reveal
  async enterVersion(version) {
    await this.includeVersionYesRadio.click()
    await this.versionInput.setValue(version)
  }

  async skipVersion() {
    await this.includeVersionNoRadio.click()
  }

  async enterPublicationDate({ day, month, year }) {
    await this.publicationDayInput.setValue(day)
    await this.publicationMonthInput.setValue(month)
    await this.publicationYearInput.setValue(year)
  }

  async markAsPassed() {
    await this.markAsPassedButton.click()
  }

  async markAsFailed() {
    await this.markAsFailedLink.click()
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
      `Review instruction manuals for ${applianceName}`,
      { replace: [/\s+/g, ' '] }
    )
  }

  async verifyPublicListingNotice(applianceName) {
    await expect(this.publicListingNotice).toHaveText(
      `These details will be published to the public listing for ${applianceName}.`
    )
  }

  //
  // ===== NAVIGATION =====
  //

  open(applicationReference, applianceCode) {
    return browser.url(
      `/admin/iteration-2/${applicationReference}/${applianceCode}/review-instruction-manual`
    )
  }
}

export default new ReviewInstructionManualPage()
