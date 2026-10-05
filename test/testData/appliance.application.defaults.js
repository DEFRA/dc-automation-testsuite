/**
 * Default values for a DXT appliance application.
 *
 * Names are not held here: the factory generates unique ones per run so submitted records can
 * be found again. `appliance` is the template for one entry in the repeatable section.
 */
export const applianceApplicationDefaults = {
  basedInUk: 'Yes',
  address: {
    addressLine1: 'Test Address Line1',
    addressLine2: 'Address Line2',
    town: 'Cambridge',
    county: 'Cambridgeshire',
    postcode: 'PE3 9DR'
  },
  contact: {
    name: 'Test Contact',
    emailAddress: 'test.contact@example.com'
  },
  appliance: {
    applianceType: 'Stove (roomheater)',
    nominalOutput: '5',
    multifuel: 'No',
    fuelToBurn: 'Wood logs only',
    variantOfCertifiedAppliance: 'No'
  }
}
