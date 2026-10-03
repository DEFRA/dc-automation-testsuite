import { FORMS_RUNNER_URL } from '../shared/service.urls.js'

/**
 * Base for all pages in the DXT "Get a stove or other appliance certified for use in smoke
 * control areas" form. Holds the chrome every page shares: heading, back link and the
 * Continue / Save and exit button group.
 *
 * This form is driven only to CREATE TEST DATA - it is not the system under test, so pages
 * carry a page-loaded check to localise failures, but no content validation.
 */
class DxtApplianceFormComponent {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('#main-content h1')
  }

  get backLink() {
    return $('.govuk-back-link')
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

  // GOV.UK gives the first radio in a group the group id and the rest an index suffix, so a
  // Yes/No question is `#<groupId>` / `#<groupId>-2`
  getYesNoRadio(groupId, answer) {
    const suffixes = { Yes: '', No: '-2' }

    if (!(answer in suffixes)) {
      throw new Error(`Yes/No answer must be "Yes" or "No", got "${answer}"`)
    }

    return $(`#${groupId}${suffixes[answer]}`)
  }

  //
  // ===== ASSERTIONS =====
  //

  // Specs don't validate this form, so each page asserts it loaded before acting - that way a
  // failure names the page the data-creation run stopped on
  async verifyPageLoaded(headingText) {
    await expect(this.pageHeading).toHaveText(headingText)
  }

  //
  // ===== NAVIGATION =====
  //

  openPath(path) {
    return browser.url(`${FORMS_RUNNER_URL}${path}`)
  }
}

export default DxtApplianceFormComponent
