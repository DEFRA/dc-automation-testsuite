import { loadApplianceApplications } from '../applicationSubmission/appliance.application.factory.js'
import { submitApplianceApplication } from '../applicationSubmission/appliance.application.submission.js'
import { passDocumentationReviews, verifyAndCompletePublicListing } from '../reviewFlows/appliance.review.flow.js'
import Dashboard from '../page-objects/hetasAdmin/hetas.admin.dashboard.page.js'
import Applications from '../page-objects/hetasAdmin/hetas.admin.applianceApplications.page.js'
import ApplicationReview from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceApplication.page.js'
import ApplianceReview from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceDetail.page.js'
import Outcome from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceOutcome.page.js'
import Complete from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceComplete.page.js'
import Records from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.applianceRecords.page.js'
import Record from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.applianceRecordDetail.page.js'
import SetStatus from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.setCertificationStatus.page.js'
import History from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.actionHistory.page.js'

const COUNTRIES = ['England', 'Scotland', 'Wales', 'Northern Ireland']
const CERTIFYING_COUNTRY = 'England'
const DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/
// WDIO reads a test's timeout before it runs, so it has to be set on the suite
const SUBMISSION_TIMEOUT = 420000

// Dashboard counts carry thousands separators, e.g. "3,358"
const toNumber = (text) => Number(text.replaceAll(',', ''))

/**
 * EAFEA-376-E2E-001 - the complete positive journey from manufacturer submission through HETAS
 * approval and government certification to the first public publication. The steps share one
 * application and depend on each other, so they must run in order (the config bails on the
 * first failure).
 */
describe('EAFEA-376-E2E-001 Happy path from manufacturer submission to live public appliance record', function () {
  this.timeout(SUBMISSION_TIMEOUT)

  const [application] = loadApplianceApplications(
    'singleApplianceApplication.json'
  )
  const submitted = application.appliances[0]
  const modelName = submitted.modelName

  let newApplicationsBefore
  let applicationReference
  let applianceName
  let recordName

  it('Step 1: precondition - the test data is ready and the HETAS dashboard is available', async () => {
    expect(application.appliances.length).toBeGreaterThan(0)

    await Dashboard.open()
    await Dashboard.verifyPageLoaded()
    const count = await Dashboard.getApplianceNewApplicationsCount()
    newApplicationsBefore = toNumber(count)
  })

  it('Step 2: the manufacturer submits an application and it appears as New', async () => {
    await submitApplianceApplication(application)

    await Applications.open()
    applicationReference =
      await Applications.waitForApplicationAwaitingReview(modelName)
    await Applications.verifyApplicationAwaitingReview(applicationReference)

    await Applications.goToDashboard()
    await Dashboard.verifyPageLoaded()
    const count = await Dashboard.getApplianceNewApplicationsCount()
    expect(toNumber(count)).toBeGreaterThan(newApplicationsBefore)
  })

  it('Step 3: HETAS starts the review, is assigned, and the application review opens', async () => {
    await Dashboard.open()
    await Dashboard.goToNewApplianceApplications()
    await Applications.verifyPageLoaded()
    await Applications.startReview(applicationReference)

    await ApplicationReview.verifyPageLoaded(applicationReference)
    applianceName = await ApplicationReview.getApplianceName(modelName)
    const status = await ApplicationReview.getApplianceStatus(applianceName)
    expect(status).toBe('Not started')

    // Starting the review moves the application to In progress under the logged-in reviewer
    await ApplicationReview.goToDashboard()
    await Dashboard.goToInProgressApplianceApplications()
    await Applications.verifyApplicationInProgress(applicationReference)
    await Applications.verifyApplicationNotAwaitingReview(applicationReference)
    const reviewer = await Applications.getReviewer(applicationReference)
    expect(reviewer).not.toBe('')

    await Applications.continueReview(applicationReference)
    await ApplicationReview.verifyPageLoaded(applicationReference)
  })

  it('Step 4: HETAS passes all four documentation reviews', async () => {
    await ApplicationReview.startApplianceReview(applianceName)
    await ApplianceReview.verifyPageLoaded(applianceName)

    await passDocumentationReviews(applianceName)
  })

  it('Step 5: HETAS completes the appliance details, permitted fuels and additional conditions', async () => {
    await verifyAndCompletePublicListing(applianceName, submitted)
  })

  it('Step 6: HETAS accepts the appliance and continues to the all-accepted outcome', async () => {
    await ApplianceReview.acceptAppliance()

    await ApplicationReview.verifyPageLoaded(applicationReference)
    const status = await ApplicationReview.getApplianceStatus(applianceName)
    expect(status).toBe('Accepted')

    await ApplicationReview.continueToNextStep()
    await Outcome.verifyPageLoaded()
    await Outcome.verifyApplianceSuitable(applianceName)
    await Outcome.verifyReadyForGovernmentApproval()
  })

  it('Step 7: HETAS submits for approval and the review completes', async () => {
    await Outcome.submitForApproval()

    await Complete.verifyPageLoaded(applicationReference)
  })

  it('Step 8: the appliance record is Pending with every country Awaiting decision', async () => {
    await Complete.goToApplianceRecords()
    await Records.verifyPageLoaded()
    await Records.search(modelName)
    await Records.verifyRecordListedByName(modelName)
    await Records.verifyStatusByName(modelName, 'Pending')
    await Records.viewByName(modelName)

    await Record.verifyPageLoaded(modelName)
    recordName = await Record.getApplianceName()
    await Record.verifyApplianceStatus('Pending government approval')
    for (const country of COUNTRIES) {
      await Record.verifyCountryStatus(country, 'Awaiting decision')
    }
    const reference = await Record.getApplicationReference()
    expect(reference).toBe(applicationReference)
  })

  it('Step 9: certifying one country makes the record Live with a public listing', async () => {
    await Record.changeCertification(CERTIFYING_COUNTRY)
    await SetStatus.verifyPageLoaded(CERTIFYING_COUNTRY, recordName)
    await SetStatus.verifyCurrentStatus('Awaiting decision')
    await SetStatus.selectCertified()
    await SetStatus.confirm()

    await Record.verifyPageLoaded(recordName)
    await Record.verifyCountryStatus(CERTIFYING_COUNTRY, 'Certified')
    const date = await Record.getCountryCertifiedDate(CERTIFYING_COUNTRY)
    expect(date).toMatch(DATE_PATTERN)
    for (const country of COUNTRIES.filter((c) => c !== CERTIFYING_COUNTRY)) {
      await Record.verifyCountryStatus(country, 'Awaiting decision')
    }

    // The first certification takes the record live automatically
    await Record.verifyApplianceStatus('Live on public list')
    await Record.verifyPublicListingAvailable()
  })

  it('Step 10: the action history records acceptance, submission, certification and going live', async () => {
    await Record.viewDetail('Action history')

    await History.verifyPageLoaded(recordName)
    const actions = [
      'Accepted at application',
      'Sent to governments for approval',
      `Certified on behalf of ${CERTIFYING_COUNTRY}`,
      'Live on public list'
    ]
    for (const action of actions) {
      await History.verifyActionListed(action)
      expect(await History.getCompletedBy(action)).not.toBe('')
    }
    // Going live is automatic, so the system rather than a person is the actor
    expect(await History.getCompletedBy('Live on public list')).toBe('System')
  })
})
