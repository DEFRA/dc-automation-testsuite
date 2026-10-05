import { loadScenarios, booleansToYesNo } from './dataset.loader.js'

// Submission returns no reference number, so records are found again by their company/brand
// name. The random part keeps parallel workers from colliding within the same millisecond.
function uniqueSuffix() {
  return `${Date.now()}${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Loads every scenario in a testData dataset, ready to submit.
 *
 * @param {string} datasetFileName e.g. 'manufactureFuelApplication.json'
 * @returns {object[]} one fuel application per scenario
 */
export function loadFuelApplications(datasetFileName) {
  return loadScenarios(datasetFileName).map((scenario) =>
    buildFuelApplication(scenario)
  )
}

/**
 * Turns one dataset scenario into submittable fuel application data, giving the company and
 * main brand name a unique suffix so the submitted record can be found again.
 */
export function buildFuelApplication(scenario) {
  const suffix = uniqueSuffix()
  const { id, ...application } = booleansToYesNo(scenario)

  return {
    id,
    ...application,
    companyName: `${application.companyName} ${suffix}`,
    brandNames: {
      ...application.brandNames,
      mainBrandName: `${application.brandNames.mainBrandName} ${suffix}`
    }
  }
}
