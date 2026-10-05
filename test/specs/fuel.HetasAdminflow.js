import { loadFuelApplications } from '../applicationSubmission/fuel.application.factory.js'
import { submitFuelApplication } from '../applicationSubmission/fuel.application.submission.js'

// Mocha builds its test list synchronously, so the datasets are read at module load
const datasets = [
  'manufactureFuelApplication.json',
  'rebrandFuelApplication.json'
]

describe('DXT fuel form', () => {
  for (const dataset of datasets) {
    for (const application of loadFuelApplications(dataset)) {
      // Data creation only - the page objects self-verify, so the spec holds no assertions
      it(`submits a fuel application: ${application.id}`, async () => {
        await submitFuelApplication(application)
      })
    }
  }
})
