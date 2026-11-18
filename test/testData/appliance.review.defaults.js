/**
 * Values HETAS enters while reviewing an appliance application. The submitted application data
 * lives in the datasets; these are the reviewer's own inputs, shared by every review journey.
 */
export const applianceReviewDefaults = {
  testResults: {
    ratedOutput: '4',
    testedOutput: '4',
    testedOutputLow: '2',
    smokeEmission: '3',
    smokeEmissionLow: '2'
  },
  instructionManual: {
    title: 'Installation and operating instructions',
    publicationDate: { day: '1', month: '3', year: '2024' }
  },
  additionalConditions: 'No additional conditions for use'
}
