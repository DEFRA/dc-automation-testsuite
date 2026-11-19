/**
 * Reusable GOV.UK error summary shown at the top of a form page after a failed submission.
 */
class ErrorSummaryComponent {
  //
  // ===== SELECTORS =====
  //

  get summary() {
    return $('.govuk-error-summary')
  }

  get errorLinks() {
    return $$('.govuk-error-summary__list a')
  }

  //
  // ===== ACTIONS =====
  //

  // WDIO's element array overrides map() to return a promise, so it is copied to a plain array
  async getMessages() {
    const links = Array.from(await this.errorLinks)
    return Promise.all(
      links.map(async (link) => (await link.getText()).trim())
    )
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyMessages(expectedMessages) {
    await expect(this.summary).toBeDisplayed()
    expect(await this.getMessages()).toEqual(expectedMessages)
  }

  async verifyNoErrors() {
    await expect(this.summary).not.toBeDisplayed()
  }
}

export default new ErrorSummaryComponent()
