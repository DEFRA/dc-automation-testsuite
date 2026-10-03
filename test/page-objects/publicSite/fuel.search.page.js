import PublicListSearchComponent, {
  RESULTS_LIST
} from './publicListSearch.component.js'

const LABELS = {
  fuelId: 'Fuel ID:'
}

/**
 * Public list - "Check if a solid fuel is certified for use in smoke control areas and for home
 * use in England" (fuel list / search / filtered results).
 *
 * Fuel names are not unique (the same brand can be listed under several fuel IDs), so lookups
 * that must resolve to a single fuel are keyed on the fuel ID instead of the name.
 */
class FuelSearchPage extends PublicListSearchComponent {
  constructor() {
    super({
      heading:
        'Check if a solid fuel is certified for use in smoke control areas and for home use in England',
      searchFormAction: 'fuel-list-search',
      filterFormAction: 'fuel-list-filtered',
      path: '/public-list/iteration-2/fuel-list'
    })
  }

  //
  // ===== SELECTORS =====
  //

  get applianceListLink() {
    return $('a[href*="appliance-list"]')
  }

  get fuelCertificationLink() {
    return $('a[href*="fuel-legal"]')
  }

  get readyToBurnSupplierLink() {
    return $('a[href*="readytoburn.org/consumers/find-a-supplier"]')
  }

  //
  // ===== HELPERS =====
  //

  getResultItemByFuelId(fuelId) {
    return $(
      `${RESULTS_LIST}/li[.//p[normalize-space()="${LABELS.fuelId} ${fuelId}"]]`
    )
  }

  //
  // ===== ACTIONS =====
  //

  async getFuelId(fuelName) {
    return this.getResultValue(fuelName, LABELS.fuelId)
  }

  async getFuelName(fuelId) {
    const item = await this.getResultItemByFuelId(fuelId)
    return (await item.$('h3 a').getText()).trim()
  }

  async getCertifiedInByFuelId(fuelId) {
    const item = await this.getResultItemByFuelId(fuelId)
    return this.readCertifiedIn(item)
  }

  async openFuel(fuelId) {
    const item = await this.getResultItemByFuelId(fuelId)
    await item.$('h3 a').click()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyFuelListed(fuelId) {
    await expect(this.getResultItemByFuelId(fuelId)).toBeDisplayed()
  }

  async verifyFuelNotListed(fuelId) {
    await expect(this.getResultItemByFuelId(fuelId)).not.toExist()
  }

  /**
   * @param {string} fuelId
   * @param {{name?: string, certifiedIn?: string[]}} expected
   */
  async verifyFuelDetails(fuelId, expected) {
    await this.verifyFuelListed(fuelId)

    if (expected.name) {
      expect(await this.getFuelName(fuelId)).toEqual(expected.name)
    }
    if (expected.certifiedIn) {
      expect(await this.getCertifiedInByFuelId(fuelId)).toEqual(
        expected.certifiedIn
      )
    }
  }
}

export default new FuelSearchPage()
