import PublicListSearchComponent from './publicListSearch.component.js'

const LABELS = {
  manufacturedBy: 'Manufactured by',
  fuelsAllowed: 'Fuels allowed:'
}

/**
 * Public list - "Check if a stove or other solid fuel appliance is certified for use in smoke
 * control areas" (appliance list / search / filtered results).
 */
class ApplianceSearchPage extends PublicListSearchComponent {
  constructor() {
    super({
      heading:
        'Check if a stove or other solid fuel appliance is certified for use in smoke control areas',
      searchFormAction: 'appliance-list-search',
      filterFormAction: 'appliance-list-filtered',
      path: '/public-list/iteration-2/appliance-list'
    })
  }

  //
  // ===== SELECTORS =====
  //

  get fuelListLink() {
    return $('a[href*="fuel-list"]')
  }

  get applianceCertificationLink() {
    return $('a[href*="appliance-legal"]')
  }

  //
  // ===== ACTIONS =====
  //

  async getManufacturedBy(applianceName) {
    return this.getResultValue(applianceName, LABELS.manufacturedBy)
  }

  async getFuelsAllowed(applianceName) {
    return this.getCommaSeparatedResultValue(applianceName, LABELS.fuelsAllowed)
  }

  //
  // ===== ASSERTIONS =====
  //

  /**
   * @param {string} applianceName
   * @param {{manufacturedBy?: string, certifiedIn?: string[], fuelsAllowed?: string[]}} expected
   */
  async verifyApplianceDetails(applianceName, expected) {
    await this.verifyResultListed(applianceName)

    if (expected.manufacturedBy) {
      expect(await this.getManufacturedBy(applianceName)).toEqual(
        expected.manufacturedBy
      )
    }
    if (expected.certifiedIn) {
      expect(await this.getCertifiedIn(applianceName)).toEqual(
        expected.certifiedIn
      )
    }
    if (expected.fuelsAllowed) {
      expect(await this.getFuelsAllowed(applianceName)).toEqual(
        expected.fuelsAllowed
      )
    }
  }
}

export default new ApplianceSearchPage()
