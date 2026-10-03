import DxtApplianceFormComponent from './dxtApplianceForm.component.js'

/**
 * DXT appliance form - "Check your answers before sending your form", the final page.
 */
class DxtApplianceCheckAnswersPage extends DxtApplianceFormComponent {
  static PATH =
    '/form/preview/draft/get-a-stove-or-other-appliance-certified-for-use-in-smoke-control-areas/summary'

  static HEADING = 'Check your answers before sending your form'

  //
  // ===== SELECTORS =====
  //

  get summaryList() {
    return $('.govuk-summary-list')
  }

  // A forms-runner built-in field, not a DXT form component
  get confirmationEmailInput() {
    return $('#userConfirmationEmailAddress')
  }

  // This page submits the application rather than continuing, so it has no Continue button
  get submitButton() {
    return $('button[name="action"][value="send"]')
  }

  //
  // ===== HELPERS =====
  //

  // Rows are keyed on the label shown in the summary, including any "(optional)" suffix
  getRow(answerKey) {
    return $(
      `//div[contains(@class,"govuk-summary-list__row")][dt[normalize-space(.)="${answerKey}"]]`
    )
  }

  //
  // ===== ACTIONS =====
  //

  async getAnswer(answerKey) {
    const value = await this.getRow(answerKey)
      .$('.govuk-summary-list__value')
      .getText()
    return value.trim()
  }

  async change(answerKey) {
    await this.getRow(answerKey).$('.govuk-summary-list__actions a').click()
  }

  async enterConfirmationEmail(emailAddress) {
    await this.confirmationEmailInput.setValue(emailAddress)
  }

  async clickSubmit() {
    await this.submitButton.click()
  }

  async submit(confirmationEmail) {
    await this.verifyPageLoaded()

    if (confirmationEmail) {
      await this.enterConfirmationEmail(confirmationEmail)
    }

    await this.clickSubmit()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await super.verifyPageLoaded(DxtApplianceCheckAnswersPage.HEADING)
    await expect(this.submitButton).toBeDisplayed()
  }

  async verifyAnswer(answerKey, expectedValue) {
    await expect(
      this.getRow(answerKey).$('.govuk-summary-list__value')
    ).toHaveText(expectedValue)
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return this.openPath(DxtApplianceCheckAnswersPage.PATH)
  }
}

export default new DxtApplianceCheckAnswersPage()
