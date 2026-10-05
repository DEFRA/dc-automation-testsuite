import { loadScenarios, booleansToYesNo } from './dataset.loader.js'

// Submission returns no reference number, so records are found again by their company/model
// name. The random part keeps parallel workers from colliding within the same millisecond.
function uniqueSuffix() {
  return `${Date.now()}${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Loads every scenario in a testData dataset, ready to submit.
 *
 * @param {string} datasetFileName e.g. 'singleApplianceApplication.json'
 * @returns {object[]} one appliance application per scenario
 */
export function loadApplianceApplications(datasetFileName) {
  return loadScenarios(datasetFileName).map((scenario) =>
    buildApplianceApplication(scenario)
  )
}

/**
 * Turns one dataset scenario into submittable appliance application data, giving the company
 * and model names a unique suffix so the submitted records can be found again.
 */
export function buildApplianceApplication(scenario) {
  const suffix = uniqueSuffix()
  const { id, ...application } = booleansToYesNo(scenario)

  return {
    id,
    ...application,
    companyName: `${application.companyName} ${suffix}`,
    appliances: application.appliances.map((appliance) => ({
      ...appliance,
      modelName: `${appliance.modelName} ${suffix}`
    }))
  }
}
