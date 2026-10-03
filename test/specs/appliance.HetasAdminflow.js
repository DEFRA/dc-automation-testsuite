import { loadApplianceApplications } from '../applicationSubmission/appliance.application.factory.js'
import { submitApplianceApplication } from '../applicationSubmission/appliance.application.submission.js'

// Mocha builds its test list synchronously, so the datasets are read at module load
const datasets = [
  'singleApplianceApplication.json',
  'multipleApplianceApplication.json'
]

describe('HETAS admin - appliance certification', () => {
  for (const dataset of datasets) {
    for (const application of loadApplianceApplications(dataset)) {
      // Step 1 - create the test data. The DXT form is not the system under test, so the only
      // checks are the page-loaded ones each page object makes for itself.
      it(`creates an appliance application: ${application.id}`, async () => {
        await submitApplianceApplication(application)
      })
    }
  }
})
