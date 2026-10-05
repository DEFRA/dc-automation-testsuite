import { FORMS_RUNNER_URL } from '../shared/service.urls.js'

/**
 * Base for all pages in the DXT "Get a solid fuel certified for use in smoke control areas"
 * form. Holds the chrome every page shares: heading, back link and the
 * Continue / Save and exit button group.
 */
class DxtFuelFormComponent {
  // Every page's path is this prefix + its own slug, so it is declared once here
  static FORM_PATH =
    '/form/preview/draft/get-a-solid-fuel-certified-for-use-in-smoke-control-areas'

  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('#main-content h1')
  }

  get backLink() {
    return $('.govuk-back-link')
  }

  get serviceName() {
    return $('.govuk-service-navigation__service-name')
  }

  // Continue is the only submit button without a name attribute; Save and exit uses name="action"
  get continueButton() {
    return $('.govuk-button-group button[type="submit"]:not([name])')
  }

  get saveAndExitButton() {
    return $('button[name="action"][value="save-and-exit"]')
  }

  //
  // ===== ACTIONS =====
  //

  async clickContinue() {
    await this.continueButton.click()
  }

  async clickSaveAndExit() {
    await this.saveAndExitButton.click()
  }

  async goBack() {
    await this.backLink.click()
  }

  async selectYesNo(groupId, answer) {
    await this.getYesNoRadio(groupId, answer).click()
  }

  //
  // ===== HELPERS =====
  //

  getRadioByValue(groupId, value) {
    return $(`input[name="${groupId}"][value="${value}"]`)
  }

  // This form's Yes/No radios carry value="true"/"false", so they are matched on value rather
  // than on the `-2` id suffix GOV.UK gives later options - immune to the answers being reordered
  getYesNoRadio(groupId, answer) {
    const values = { Yes: 'true', No: 'false' }

    if (!(answer in values)) {
      throw new Error(`Yes/No answer must be "Yes" or "No", got "${answer}"`)
    }

    return this.getRadioByValue(groupId, values[answer])
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded(headingText) {
    await expect(this.pageHeading).toHaveText(headingText)
  }

  //
  // ===== NAVIGATION =====
  //

  open(slug) {
    return browser.url(
      `${FORMS_RUNNER_URL}${DxtFuelFormComponent.FORM_PATH}/${slug}`
    )
  }
}

export default DxtFuelFormComponent
