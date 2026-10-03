import DxtApplianceFormComponent from './dxtApplianceForm.component.js'
import PostcodeLookup from '../shared/postcodeLookup.component.js'

/**
 * DXT appliance form - "Company address".
 *
 * The address inputs on this page are hidden until an address step is chosen. Test data always
 * takes the "enter address manually" route, which hands off to the shared postcode lookup page,
 * to avoid the external address lookup.
 */
class DxtApplianceCompanyAddressPage extends DxtApplianceFormComponent {
  static PATH =
    '/form/preview/draft/get-a-stove-or-other-appliance-certified-for-use-in-smoke-control-areas/company-address'

  static HEADING = 'Company address'

  //
  // ===== SELECTORS =====
  //

  // Both address buttons embed a DXT-generated id in their value, so they are matched on text
  get enterAddressManuallyButton() {
    return $('//button[normalize-space(.)="enter address manually"]')
  }

  get findAddressButton() {
    return $('//button[normalize-space(.)="Find an address"]')
  }

  // Only rendered once the postcode lookup has returned an address
  get selectedAddress() {
    return $('.govuk-inset-text')
  }

  get useADifferentAddressButton() {
    return $('//button[normalize-space(.)="Use a different address"]')
  }

  //
  // ===== ACTIONS =====
  //

  async enterAddressManually() {
    await this.enterAddressManuallyButton.click()
    await PostcodeLookup.verifyManualEntryLoaded()
  }

  async findAnAddress() {
    await this.findAddressButton.click()
    await PostcodeLookup.verifyDetailsStepLoaded()
  }

  async submit(address) {
    await this.verifyPageLoaded()
    await this.enterAddressManually()
    await PostcodeLookup.submitManualAddress(address)
    await this.verifyAddressSelected()
    await this.clickContinue()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyAddressSelected() {
    await expect(this.selectedAddress).toBeDisplayed()
  }

  // Heading only - the page renders either the address buttons or the selected address block
  async verifyPageLoaded() {
    await super.verifyPageLoaded(DxtApplianceCompanyAddressPage.HEADING)
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return this.openPath(DxtApplianceCompanyAddressPage.PATH)
  }
}

export default new DxtApplianceCompanyAddressPage()
