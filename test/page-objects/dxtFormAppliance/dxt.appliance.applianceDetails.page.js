import DxtApplianceFormComponent from './dxtApplianceForm.component.js'

/**
 * DXT appliance form - "Appliance details".
 *
 * Part of a repeatable section ("Appliance 1", "Appliance 2", ...), so the page URL carries a
 * generated appliance id and can only be opened directly if that id is known.
 */
class DxtApplianceApplianceDetailsPage extends DxtApplianceFormComponent {
  static PATH_PREFIX =
    '/form/preview/draft/get-a-stove-or-other-appliance-certified-for-use-in-smoke-control-areas/appliance-details'

  static HEADING = 'Appliance details'

  static APPLIANCE_TYPES = [
    'Stove (roomheater)',
    'Independent boiler',
    'Inset appliance',
    'Cooker',
    'Pizza oven',
    'Other'
  ]

  //
  // ===== SELECTORS =====
  //

  // Identifies which appliance in the repeatable section is being filled in, e.g. "Appliance 1"
  get sectionCaption() {
    return $('#section-title')
  }

  // Model name
  get modelNameInput() {
    return $('#cciwNV')
  }

  // Model number (optional)
  get modelNumberInput() {
    return $('#oSUxHw')
  }

  // What is the appliance's nominal (thermal) output? - in kW
  get nominalOutputInput() {
    return $('#jxCIYY')
  }

  // What fuel will the appliance be certified to burn?
  get fuelToBurnTextarea() {
    return $('#NGfXVf')
  }

  // If yes, what is the certified appliance? (optional)
  get certifiedApplianceTextarea() {
    return $('#GFREno')
  }

  //
  // ===== HELPERS =====
  //

  // What type of appliance is it? - options carry meaningful values, so they are matched on
  // value rather than the id's index suffix. The option list has changed before, so an unknown
  // value fails here with the valid set rather than as a missing element
  getApplianceTypeRadio(applianceType) {
    const validTypes = DxtApplianceApplianceDetailsPage.APPLIANCE_TYPES

    if (!validTypes.includes(applianceType)) {
      throw new Error(
        `Appliance type must be one of ${validTypes.join(', ')}, got "${applianceType}"`
      )
    }

    return $(`input[name="LkASfn"][value="${applianceType}"]`)
  }

  //
  // ===== ACTIONS =====
  //

  async enterApplianceDetails({
    modelName,
    modelNumber,
    applianceType,
    nominalOutput,
    multifuel,
    fuelToBurn,
    variantOfCertifiedAppliance,
    certifiedAppliance
  }) {
    await this.modelNameInput.setValue(modelName)

    if (modelNumber) {
      await this.modelNumberInput.setValue(modelNumber)
    }

    await this.getApplianceTypeRadio(applianceType).click()
    await this.nominalOutputInput.setValue(nominalOutput)
    await this.selectYesNo('Ltjqls', multifuel)
    await this.fuelToBurnTextarea.setValue(fuelToBurn)
    await this.selectYesNo('mVqdEy', variantOfCertifiedAppliance)

    // The form marks this "(optional)", but it is the answer to the variant question above
    if (variantOfCertifiedAppliance === 'Yes') {
      if (!certifiedAppliance) {
        throw new Error(
          'certifiedAppliance is required when variantOfCertifiedAppliance is "Yes"'
        )
      }

      await this.certifiedApplianceTextarea.setValue(certifiedAppliance)
    }
  }

  async submit(applianceDetails) {
    await this.verifyPageLoaded()
    await this.enterApplianceDetails(applianceDetails)
    await this.clickContinue()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await super.verifyPageLoaded(DxtApplianceApplianceDetailsPage.HEADING)
    await expect(this.modelNameInput).toBeDisplayed()
  }

  async verifyApplianceNumber(applianceNumber) {
    await expect(this.sectionCaption).toHaveText(`Appliance ${applianceNumber}`)
  }

  //
  // ===== NAVIGATION =====
  //

  open(applianceId) {
    return this.openPath(
      `${DxtApplianceApplianceDetailsPage.PATH_PREFIX}/${applianceId}`
    )
  }
}

export default new DxtApplianceApplianceDetailsPage()
