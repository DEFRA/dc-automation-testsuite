import RecordsListComponent from './recordsList.component.js'

/**
 * Devolved admin alternate path - "Appliance records" list.
 * Reached from the HETAS admin dashboard's "Go to appliance records" link; used by HETAS
 * admin to review/action appliance records when devolved admin has not completed the
 * correct approval flow.
 */
class DevolvedAdminAltApplianceRecordsPage extends RecordsListComponent {
  constructor() {
    super('Application records')
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded() {
    await expect(this.pageHeading).toHaveText('Appliance records')
  }

  //
  // ===== NAVIGATION =====
  //

  open() {
    return browser.url('/appliance-records')
  }
}

export default new DevolvedAdminAltApplianceRecordsPage()
