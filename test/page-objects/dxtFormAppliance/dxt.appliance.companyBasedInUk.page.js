import DxtApplianceFormComponent from './dxtApplianceForm.component.js'

/**
 * DXT appliance form - "Is your company based in the UK?".
 */
class DxtApplianceCompanyBasedInUkPage extends DxtApplianceFormComponent {
  static PATH =
    '/form/preview/draft/get-a-stove-or-other-appliance-certified-for-use-in-smoke-control-areas/is-your-company-based-in-the-uk'

  static HEADING = 'Does your company have a UK address?'

  static RADIO_GROUP_ID = 'TbMaXV'

  //
  // ===== SELECTORS =====
  //

  // Is your company based in the UK? - Yes
  get yesRadio() {
    return this.getYesNoRadio(
      DxtApplianceCompanyBasedInUkPage.RADIO_GROUP_ID,
      'Yes'
    )
  }

  //
  // ===== ACTIONS =====
  //

  async submit(answer) {
    await this.verifyPageLoaded()
    await this.selectYesNo(
      DxtApplianceCompanyBasedInUkPage.RADIO_GROUP_ID,
      answer
    )
    await this.clickContinue()
  }

  //
  // ===== ASSERTIONS =====
  //

  // GOV.UK radio inputs are opacity: 0 behind their label, so they never report as displayed
  async verifyPageLoaded() {
    await super.verifyPageLoaded(DxtApplianceCompanyBasedInUkPage.HEADING)
    await expect(this.yesRadio).toExist()
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return this.openPath(DxtApplianceCompanyBasedInUkPage.PATH)
  }
}

export default new DxtApplianceCompanyBasedInUkPage()
