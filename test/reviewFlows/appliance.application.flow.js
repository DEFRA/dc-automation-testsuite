import { submitApplianceApplication } from '../applicationSubmission/appliance.application.submission.js'
import { passTestReports } from './appliance.review.flow.js'
import Dashboard from '../page-objects/hetasAdmin/hetas.admin.dashboard.page.js'
import Applications from '../page-objects/hetasAdmin/hetas.admin.applianceApplications.page.js'
import ApplicationReview from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceApplication.page.js'
import ApplianceReview from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceDetail.page.js'

/**
 * Application-level steps shared by journeys that decide a multi-appliance application.
 */

/**
 * Submits the application through the DXT form and returns the reference the admin gave it.
 * Checks it is listed as New with every appliance.
 */
export async function submitApplication(application) {
  const [first] = application.appliances

  await submitApplianceApplication(application)

  await Applications.open()
  const reference = await Applications.waitForApplicationAwaitingReview(
    first.modelName
  )
  await Applications.verifyApplicationAwaitingReview(reference)
  const products = await Applications.getNotStartedProducts(reference)
  for (const { modelName } of application.appliances) {
    expect(products).toContain(modelName)
  }

  return reference
}

/**
 * Starts the review as the logged-in reviewer and checks the application moves to In progress.
 * Leaves the browser on the application review page.
 *
 * @returns the application review URL, the reviewer, and each appliance's displayed name by model name
 */
export async function startReview(applicationReference, application) {
  await Dashboard.open()
  await Dashboard.goToNewApplianceApplications()
  await Applications.verifyPageLoaded()
  await Applications.startReview(applicationReference)

  await ApplicationReview.verifyPageLoaded(applicationReference)
  const applicationReviewUrl = await browser.getUrl()

  const applianceNames = new Map()
  for (const { modelName } of application.appliances) {
    const name = await ApplicationReview.getApplianceName(modelName)
    applianceNames.set(modelName, name)
    const status = await ApplicationReview.getApplianceStatus(name)
    expect(status).toBe('Not started')
  }

  await ApplicationReview.goToDashboard()
  await Dashboard.goToInProgressApplianceApplications()
  await Applications.verifyApplicationInProgress(applicationReference)
  await Applications.verifyApplicationNotAwaitingReview(applicationReference)
  const reviewer = await Applications.getReviewer(applicationReference)
  expect(reviewer).not.toBe('')

  await browser.url(applicationReviewUrl)
  return { applicationReviewUrl, applianceNames, reviewer }
}

/**
 * Rejects one appliance from the application review page, optionally after passing its test
 * reports. Rejection is immediate, so the browser ends back on the application review page.
 */
export async function rejectAppliance({
  applicationReference,
  applianceName,
  reviewFirst = false
}) {
  await ApplicationReview.startApplianceReview(applianceName)
  await ApplianceReview.verifyPageLoaded(applianceName)
  if (reviewFirst) {
    await passTestReports(applianceName)
  }
  await ApplianceReview.rejectAppliance()

  await ApplicationReview.verifyPageLoaded(applicationReference)
  const status = await ApplicationReview.getApplianceStatus(applianceName)
  expect(status).toBe('Rejected')
}

/**
 * Rejects each appliance in turn from the application review page.
 *
 * @param {{applianceName: string, reviewFirst?: boolean}[]} items
 */
export async function rejectAppliances(applicationReference, items) {
  for (const { applianceName, reviewFirst } of items) {
    await rejectAppliance({ applicationReference, applianceName, reviewFirst })
  }
}

export async function verifyApplianceStatuses(statusByApplianceName) {
  for (const [applianceName, expectedStatus] of statusByApplianceName) {
    const status = await ApplicationReview.getApplianceStatus(applianceName)
    expect(status).toBe(expectedStatus)
  }
}
