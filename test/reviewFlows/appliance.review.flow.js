import { applianceReviewDefaults as review } from '../testData/appliance.review.defaults.js'
import ApplicationReview from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceApplication.page.js'
import ApplianceReview from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceDetail.page.js'
import TestReports from '../page-objects/hetasAdmin/hetas.admin.reviewTestReports.page.js'
import TechnicalDrawings from '../page-objects/hetasAdmin/hetas.admin.reviewTechnicalDrawings.page.js'
import ConformityMark from '../page-objects/hetasAdmin/hetas.admin.reviewConformityMark.page.js'
import InstructionManual from '../page-objects/hetasAdmin/hetas.admin.reviewInstructionManual.page.js'
import ApplianceDetails from '../page-objects/hetasAdmin/hetas.admin.checkApplianceDetails.page.js'
import PermittedFuel from '../page-objects/hetasAdmin/hetas.admin.permittedFuel.page.js'
import AdditionalConditions from '../page-objects/hetasAdmin/hetas.admin.additionalConditions.page.js'

/**
 * Review steps shared by every appliance certification journey. Each starts and ends on the
 * review page of the appliance being worked on.
 */

export async function verifyTaskStatus(taskName, expectedStatus) {
  const status = await ApplianceReview.getTaskStatus(taskName)
  expect(status).toBe(expectedStatus)
}

export async function passDocumentationReviews(applianceName) {
  await ApplianceReview.openTask('Review test reports')
  await TestReports.verifyPageLoaded(applianceName)
  await TestReports.enterTestResults(review.testResults)
  await TestReports.markAsPassed()
  await ApplianceReview.verifyPageLoaded(applianceName)
  await verifyTaskStatus('Review test reports', 'Passed')

  await ApplianceReview.openTask('Review technical drawings')
  await TechnicalDrawings.verifyPageLoaded(applianceName)
  await TechnicalDrawings.markAsPassed()
  await ApplianceReview.verifyPageLoaded(applianceName)
  await verifyTaskStatus('Review technical drawings', 'Passed')

  await ApplianceReview.openTask('Review conformity mark')
  await ConformityMark.verifyPageLoaded(applianceName)
  await ConformityMark.markAsPassed()
  await ApplianceReview.verifyPageLoaded(applianceName)
  await verifyTaskStatus('Review conformity mark', 'Passed')

  await ApplianceReview.openTask('Review instruction manual')
  await InstructionManual.verifyPageLoaded(applianceName)
  await InstructionManual.enterManualTitle(review.instructionManual.title)
  await InstructionManual.skipVersion()
  await InstructionManual.enterPublicationDate(
    review.instructionManual.publicationDate
  )
  await InstructionManual.markAsPassed()
  await ApplianceReview.verifyPageLoaded(applianceName)
  await verifyTaskStatus('Review instruction manual', 'Passed')
}

/**
 * Checks the appliance details against what the manufacturer submitted, then completes the
 * three public listing tasks.
 */
export async function verifyAndCompletePublicListing(applianceName, submitted) {
  await ApplianceReview.openTask('Check appliance details')
  await ApplianceDetails.verifyPageLoaded(applianceName)
  const detail = (label) => ApplianceDetails.getApplianceDetail(label)
  expect(await detail('Model name')).toBe(applianceName)
  expect(await detail('Model number (optional)')).toBe(submitted.modelNumber)
  expect(await detail('Appliance type')).toBe(submitted.applianceType)
  expect(await detail('Nominal (thermal) output')).toBe(
    `${submitted.nominalOutput} kW`
  )
  await ApplianceDetails.markAsCompleted()
  await ApplianceReview.verifyPageLoaded(applianceName)
  await verifyTaskStatus('Check appliance details', 'Completed')

  await ApplianceReview.openTask('Check permitted fuels')
  await PermittedFuel.verifyPageLoaded(applianceName)
  // Permitted fuels are pre-filled from the application; the wood answer must still be given
  expect(await PermittedFuel.getPermittedFuels()).not.toBe('')
  await PermittedFuel.markBurnsWoodYes()
  await PermittedFuel.markAsCompleted()
  await ApplianceReview.verifyPageLoaded(applianceName)
  await verifyTaskStatus('Check permitted fuels', 'Completed')

  await ApplianceReview.openTask('Enter additional conditions')
  await AdditionalConditions.verifyPageLoaded(applianceName)
  await AdditionalConditions.enterAdditionalConditions(
    review.additionalConditions
  )
  await AdditionalConditions.saveAndMarkAsCompleted()
  await ApplianceReview.verifyPageLoaded(applianceName)
  await verifyTaskStatus('Enter additional conditions', 'Completed')
}

/**
 * Reviews one appliance from the application review page to acceptance, ending back on the
 * application review page.
 */
export async function reviewAndAcceptAppliance({
  applicationReference,
  applianceName,
  submitted
}) {
  await ApplicationReview.startApplianceReview(applianceName)
  await ApplianceReview.verifyPageLoaded(applianceName)

  await passDocumentationReviews(applianceName)
  await verifyAndCompletePublicListing(applianceName, submitted)
  await ApplianceReview.acceptAppliance()

  await ApplicationReview.verifyPageLoaded(applicationReference)
  const status = await ApplicationReview.getApplianceStatus(applianceName)
  expect(status).toBe('Accepted')
}
