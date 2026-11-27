import allure from '@wdio/allure-reporter'
import { loadApplianceApplications } from '../applicationSubmission/appliance.application.factory.js'
import {
  OUTCOME_SECTIONS,
  REJECTION_DATE_PATTERN,
  historyActions,
  listStatus,
  outcomeIntro,
  recordStatus
} from '../testData/appliance.outcome.messages.js'
import { KNOWN_DEFECTS } from '../testData/knownDefects.js'
import { knownDefect } from '../utils/knownDefect.js'
import { reviewAndAcceptAppliance, verifyTaskStatus } from '../reviewFlows/appliance.review.flow.js'
import { rejectAppliance, startReview, submitApplication, verifyApplianceStatuses } from '../reviewFlows/appliance.application.flow.js'
import Dashboard from '../page-objects/hetasAdmin/hetas.admin.dashboard.page.js'
import Applications from '../page-objects/hetasAdmin/hetas.admin.applianceApplications.page.js'
import ApplicationReview from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceApplication.page.js'
import IncompleteApplication from '../page-objects/hetasAdmin/hetas.admin.incompleteApplicationReview.page.js'
import Outcome from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceOutcome.page.js'
import Complete from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceComplete.page.js'
import Records from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.applianceRecords.page.js'
import Record from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.applianceRecordDetail.page.js'
import History from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.actionHistory.page.js'

const DATASET = 'mixedOutcomeApplication.json'
// Carries the checks that need two unsuitable appliances and a partly reviewed rejection
const PRIMARY_SCENARIO = 'three-appliances-one-accepted'
const COUNTRIES = ['England', 'Scotland', 'Wales', 'Northern Ireland']
// WDIO reads a test's timeout before it runs, so it has to be set on the suite
const SUITE_TIMEOUT = 900000

// Dashboard counts carry thousands separators, e.g. "3,358"
const toNumber = (text) => Number(text.replaceAll(',', ''))

const labelSeverity = (severity) =>
  beforeEach(() => allure.addSeverity(severity))

/**
 * EAFEA-376-E2E-003 - one application whose appliances are split between accepted and rejected.
 * Only the accepted appliances go to governments; the rejected ones get a Rejected record. Every
 * scenario runs the core journey (the accepted:rejected split is the boundary); the primary one
 * adds the extra negative, boundary and known-defect checks. Tests share one application and
 * run in order.
 */
const applications = loadApplianceApplications(DATASET)

for (const application of applications) {
  const isPrimary = application.id === PRIMARY_SCENARIO

  describe(`EAFEA-376-E2E-003 Mixed accepted and rejected application outcome (${application.id})`, function () {
    this.timeout(SUITE_TIMEOUT)

    const { appliances } = application
    const suitable = appliances.filter(({ decision }) => decision === 'accept')
    const unsuitable = appliances.filter(({ decision }) => decision === 'reject')
    const lastUnsuitable = unsuitable.at(-1)
    const partiallyReviewed = unsuitable.find(
      ({ reviewBeforeRejecting }) => reviewBeforeRejecting
    )

    let applicationReference
    let applicationReviewUrl
    let applianceNames = new Map()
    let newApplicationsBefore
    let recordsBefore

    const nameOf = (appliance) => applianceNames.get(appliance.modelName)
    const namesOf = (list) => list.map(nameOf)
    const openApplicationReview = () => browser.url(applicationReviewUrl)

    const decisionStatus = (appliance) =>
      appliance.decision === 'accept' ? 'Accepted' : 'Rejected'

    // Expected statuses once only `decided` appliances have their final decision
    const statusesAfter = (decided) =>
      new Map(
        appliances.map((appliance) => [
          nameOf(appliance),
          decided.includes(appliance) ? decisionStatus(appliance) : 'Not started'
        ])
      )

    const unsuitableBeforeLast = unsuitable.slice(0, -1)

    const findRecord = async (modelName) => {
      await Records.open()
      await Records.verifyPageLoaded()
      await Records.search(modelName)
      await Records.verifyRecordListedByName(modelName)
      expect(await Records.countRowsByName(modelName)).toBe(1)
    }

    beforeEach(() => {
      allure.addFeature('HETAS admin - appliance certification')
      allure.addStory('EAFEA-376-E2E-003 Mixed accepted and rejected outcome')
    })

    describe('Preconditions', () => {
      labelSeverity('critical')

      it('Precondition: the application mixes suitable and unsuitable appliances and the dashboard is available', async () => {
        expect(appliances.length).toBeGreaterThan(1)
        expect(suitable.length).toBeGreaterThan(0)
        expect(unsuitable.length).toBeGreaterThan(0)

        await Dashboard.open()
        await Dashboard.verifyPageLoaded()
        newApplicationsBefore = toNumber(
          await Dashboard.getApplianceNewApplicationsCount()
        )
        recordsBefore = toNumber(await Dashboard.getApplianceRecordsCount())
      })

      it('Precondition: the manufacturer submits the application and it appears as New with every appliance', async () => {
        applicationReference = await submitApplication(application)

        await Applications.goToDashboard()
        await Dashboard.verifyPageLoaded()
        const count = await Dashboard.getApplianceNewApplicationsCount()
        expect(toNumber(count)).toBeGreaterThan(newApplicationsBefore)
      })

      it('Precondition: HETAS starts the review and every appliance is Not started', async () => {
        const started = await startReview(applicationReference, application)
        applicationReviewUrl = started.applicationReviewUrl
        applianceNames = started.applianceNames
      })
    })

    describe('Decisions', () => {
      labelSeverity('critical')

      it('Step 2: HETAS completes all checks and accepts the suitable appliances', async () => {
        await openApplicationReview()
        for (const appliance of suitable) {
          await reviewAndAcceptAppliance({
            applicationReference,
            applianceName: nameOf(appliance),
            submitted: appliance
          })
        }

        await verifyApplianceStatuses(statusesAfter(suitable))
      })

      it('Step 3: HETAS rejects the unsuitable appliances while one is still undecided', async () => {
        await openApplicationReview()
        for (const appliance of unsuitableBeforeLast) {
          await rejectAppliance({
            applicationReference,
            applianceName: nameOf(appliance),
            reviewFirst: Boolean(appliance.reviewBeforeRejecting)
          })
        }

        await verifyApplianceStatuses(
          statusesAfter([...suitable, ...unsuitableBeforeLast])
        )
      })

      if (partiallyReviewed) {
        it('Boundary: rejecting after a partial review keeps the earlier result and nothing else', async () => {
          const name = nameOf(partiallyReviewed)
          await openApplicationReview()
          await ApplicationReview.startApplianceReview(name)

          await verifyTaskStatus('Review test reports', 'Passed')
          await verifyTaskStatus('Review technical drawings', 'Not reviewed')
          await verifyTaskStatus('Review conformity mark', 'Not reviewed')
          await verifyTaskStatus('Review instruction manual', 'Not reviewed')
          await verifyTaskStatus('Check appliance details', 'Not completed')
          await verifyTaskStatus('Check permitted fuels', 'Not completed')
          await verifyTaskStatus('Enter additional conditions', 'Not completed')
        })
      }

      it('Negative: continuing while an appliance is undecided asks for a final decision', async () => {
        await openApplicationReview()
        await ApplicationReview.continueToNextStep()

        await IncompleteApplication.verifyPageLoaded()
        await IncompleteApplication.verifyFinalDecisionRequired()
        await IncompleteApplication.verifyReturnsToApplication(
          applicationReference
        )
        await verifyApplianceStatuses(
          statusesAfter([...suitable, ...unsuitableBeforeLast])
        )
      })

      it('Step 3: HETAS rejects the last unsuitable appliance with no checks completed', async () => {
        await rejectAppliance({
          applicationReference,
          applianceName: nameOf(lastUnsuitable)
        })

        await verifyApplianceStatuses(statusesAfter(appliances))
      })
    })

    describe('Outcome and submission', () => {
      labelSeverity('critical')

      it('Step 4: HETAS continues and the outcome separates the unsuitable and suitable appliances', async () => {
        await ApplicationReview.continueToNextStep()

        await Outcome.verifyPageLoaded()
        const listedUnsuitable = await Outcome.getSectionAppliances(
          OUTCOME_SECTIONS.unsuitable
        )
        const listedSuitable = await Outcome.getSectionAppliances(
          OUTCOME_SECTIONS.suitable
        )
        expect([...listedUnsuitable].sort()).toEqual(
          namesOf(unsuitable).sort()
        )
        expect([...listedSuitable].sort()).toEqual(namesOf(suitable).sort())
        expect(
          listedSuitable.filter((name) => listedUnsuitable.includes(name))
        ).toEqual([])

        expect(
          await Outcome.getSectionIntroText(OUTCOME_SECTIONS.unsuitable)
        ).toMatch(outcomeIntro.unsuitable)
        expect(
          await Outcome.getSectionIntroText(OUTCOME_SECTIONS.suitable)
        ).toMatch(outcomeIntro.suitable)
        await Outcome.verifyUnsuitableAdviceShown()
        await Outcome.verifyReadyForGovernmentApproval()
      })

      if (isPrimary) {
        it('Boundary: returning from the outcome keeps every decision', async () => {
          await Outcome.returnToApplicationReview()

          await ApplicationReview.verifyPageLoaded(applicationReference)
          await verifyApplianceStatuses(statusesAfter(appliances))
          await ApplicationReview.continueToNextStep()
          await Outcome.verifyPageLoaded()
        })

        // Registered here, not in a nested suite: Mocha runs nested suites after a suite's own tests
        knownDefect(KNOWN_DEFECTS.outcomeSingularWording, async () => {
          const intro = await Outcome.getSectionIntroText(
            OUTCOME_SECTIONS.unsuitable
          )
          expect(intro).toMatch(outcomeIntro.unsuitablePlural)
        })
      }

      it('Step 5: HETAS submits for approval and the review completes', async () => {
        await Outcome.submitForApproval()

        await Complete.verifyPageLoaded(applicationReference)
      })

      if (isPrimary) {
        it('Negative: submitting a second time creates no duplicate records', async () => {
          await browser.back()
          if (await Outcome.submitForApprovalLink.isExisting()) {
            await Outcome.submitForApproval()
          }
        })
      }
    })

    describe('Appliance records', () => {
      labelSeverity('critical')

      it('Accepted appliances: one Pending record each, sent to every country for a decision', async () => {
        for (const appliance of suitable) {
          const name = nameOf(appliance)
          await findRecord(appliance.modelName)
          await Records.verifyStatusByName(
            appliance.modelName,
            listStatus.accepted
          )
          await Records.viewByName(appliance.modelName)

          await Record.verifyPageLoaded(name)
          await Record.verifyApplianceStatus(recordStatus.accepted)
          for (const country of COUNTRIES) {
            await Record.verifyCountryStatus(country, 'Awaiting decision')
          }
          expect(await Record.getApplicationReference()).toBe(
            applicationReference
          )

          await Record.viewDetail('Action history')
          await History.verifyPageLoaded(name)
          await History.verifyActionListed(historyActions.accepted)
          await History.verifyActionListed(historyActions.sent)
          expect(await History.getCompletedBy(historyActions.sent)).toBe(
            'System'
          )
        }
      })

      it('Rejected appliances: one Rejected record each, never sent to governments', async () => {
        for (const appliance of unsuitable) {
          const name = nameOf(appliance)
          await findRecord(appliance.modelName)
          await Records.verifyStatusByName(
            appliance.modelName,
            listStatus.rejected
          )
          await Records.viewByName(appliance.modelName)

          await Record.verifyPageLoaded(name)
          await Record.verifyApplianceStatus(recordStatus.rejected)
          await Record.verifyNoCertificationDetails()
          expect(await Record.getDetailValue('Rejected by')).not.toBe('')
          expect(await Record.getDetailValue('Date rejected')).toMatch(
            REJECTION_DATE_PATTERN
          )
          expect(await Record.getApplicationReference()).toBe(
            applicationReference
          )

          const recordUrl = await browser.getUrl()
          await browser.url(`${recordUrl}/action-history`)
          await History.verifyPageLoaded(name)
          await History.verifyActionListed(historyActions.rejected)
          await History.verifyActionNotListed(historyActions.accepted)
          await History.verifyActionNotListed(historyActions.sent)
        }
      })

      if (isPrimary) {
        it('Boundary: the details pages of a rejected record open for that appliance', async () => {
          const [appliance] = unsuitable
          const name = nameOf(appliance)
          await findRecord(appliance.modelName)
          await Records.viewByName(appliance.modelName)
          await Record.verifyPageLoaded(name)

          await Record.verifyDetailPageOpens('Appliance details', {
            path: '/appliance-details',
            heading: 'Appliance details'
          })
          await Record.verifyDetailPageOpens('Test results', {
            path: '/test-reports',
            heading: `Test results for ${name}`
          })
          await Record.verifyDetailPageOpens('Instruction manual', {
            path: '/instruction-manual',
            heading: `Instruction manual for ${name}`
          })
          const applicationLabel = `Application ${applicationReference} details`
          await Record.verifyDetailPageOpens(applicationLabel, {
            path: '/application-details',
            heading: applicationLabel
          })
        })
      }

      it('The application leaves both lists and the records count rises by the accepted appliances', async () => {
        await Applications.open()
        await Applications.verifyApplicationNotAwaitingReview(
          applicationReference
        )
        await Applications.verifyApplicationNotInProgress(applicationReference)

        await Dashboard.open()
        const records = toNumber(await Dashboard.getApplianceRecordsCount())
        expect(records).toBeGreaterThanOrEqual(recordsBefore + suitable.length)
      })
    })
  })
}
