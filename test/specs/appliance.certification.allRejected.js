import allure from '@wdio/allure-reporter'
import { loadApplianceApplications } from '../applicationSubmission/appliance.application.factory.js'
import {
  ALL_REJECTED_INTRO,
  completionLinkPaths
} from '../testData/appliance.outcome.messages.js'
import { labelSeverity } from '../utils/allure.helpers.js'
import { KNOWN_DEFECTS } from '../testData/knownDefects.js'
import { knownDefect } from '../utils/knownDefect.js'
import { verifyTaskStatus } from '../reviewFlows/appliance.review.flow.js'
import {
  rejectAppliances,
  startReview,
  submitApplication,
  verifyApplianceStatuses
} from '../reviewFlows/appliance.application.flow.js'
import {
  findRecord,
  verifyApplicationClosed,
  verifyOnlyInRejectedQueue,
  verifyOnlyRejectedRecord,
  verifyRejectedRecord
} from '../reviewFlows/appliance.records.flow.js'
import Dashboard from '../page-objects/hetasAdmin/hetas.admin.dashboard.page.js'
import Applications from '../page-objects/hetasAdmin/hetas.admin.applianceApplications.page.js'
import ApplicationReview from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceApplication.page.js'
import IncompleteApplication from '../page-objects/hetasAdmin/hetas.admin.incompleteApplicationReview.page.js'
import Outcome from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceOutcome.page.js'
import Complete from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceComplete.page.js'
import Records from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.applianceRecords.page.js'
import Record from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.applianceRecordDetail.page.js'

const DATASET = 'allRejectedApplication.json'
// Carries the checks that need a partly reviewed rejection and several appliances
const PRIMARY_SCENARIO = 'two-appliances-all-rejected'
// WDIO reads a test's timeout before it runs, so it has to be set on the suite
const SUITE_TIMEOUT = 900000

/**
 * EAFEA-376-E2E-004 - an application where every appliance is unsuitable. HETAS can only finish
 * the review (there is nothing to submit for approval), nothing is sent to governments and every
 * appliance gets a Rejected record. The scenarios cover one, two and three appliances; the primary
 * one adds the extra negative, boundary and double-submit checks. Tests share one application and
 * run in order.
 */
const applications = loadApplianceApplications(DATASET)

for (const application of applications) {
  const isPrimary = application.id === PRIMARY_SCENARIO

  describe(`EAFEA-376-E2E-004 All appliances rejected, no government submission (${application.id})`, function () {
    this.timeout(SUITE_TIMEOUT)

    const { appliances } = application
    const lastAppliance = appliances.at(-1)
    const beforeLast = appliances.slice(0, -1)
    const partiallyReviewed = appliances.find(
      ({ reviewBeforeRejecting }) => reviewBeforeRejecting
    )

    let applicationReference
    let applicationReviewUrl
    let completionUrl
    let reviewer
    let applianceNames = new Map()

    const nameOf = (appliance) => applianceNames.get(appliance.modelName)
    const namesOf = (list) => list.map(nameOf)
    const openApplicationReview = () => browser.url(applicationReviewUrl)
    const openCompletion = () => browser.url(completionUrl)

    const rejectionItems = (list) =>
      list.map((appliance) => ({
        applianceName: nameOf(appliance),
        reviewFirst: Boolean(appliance.reviewBeforeRejecting)
      }))

    const statusesOf = (decided) =>
      new Map(
        appliances.map((appliance) => [
          nameOf(appliance),
          decided.includes(appliance) ? 'Rejected' : 'Not started'
        ])
      )

    beforeEach(() => {
      allure.addFeature('HETAS admin - appliance certification')
      allure.addStory('EAFEA-376-E2E-004 All appliances rejected')
    })

    describe('Preconditions', () => {
      labelSeverity('critical')

      it('Precondition: every appliance in the application is unsuitable and the dashboard is available', async () => {
        expect(appliances.length).toBeGreaterThan(0)
        for (const { decision } of appliances) {
          expect(decision).toBe('reject')
        }

        await Dashboard.open()
        await Dashboard.verifyPageLoaded()
      })

      it('Precondition: the manufacturer submits the application and it appears as New with every appliance', async () => {
        applicationReference = await submitApplication(application)
      })

      it('Precondition: HETAS starts the review and every appliance is Not started', async () => {
        const started = await startReview(applicationReference, application)
        applicationReviewUrl = started.applicationReviewUrl
        applianceNames = started.applianceNames
        reviewer = started.reviewer
      })
    })

    describe('Step 2: reject every appliance', () => {
      labelSeverity('critical')

      it('Negative: continuing before any decision asks for a final decision', async () => {
        await openApplicationReview()
        await ApplicationReview.continueToNextStep()

        await IncompleteApplication.verifyPageLoaded()
        await IncompleteApplication.verifyFinalDecisionRequired()
        await IncompleteApplication.verifyReturnsToApplication(
          applicationReference
        )
        await verifyApplianceStatuses(statusesOf([]))
      })

      if (beforeLast.length > 0) {
        it('HETAS rejects every appliance but the last', async () => {
          await rejectAppliances(
            applicationReference,
            rejectionItems(beforeLast)
          )

          await verifyApplianceStatuses(statusesOf(beforeLast))
        })

        it('Negative: continuing while one appliance is undecided asks for a final decision', async () => {
          await ApplicationReview.continueToNextStep()

          await IncompleteApplication.verifyPageLoaded()
          await IncompleteApplication.verifyFinalDecisionRequired()
          await IncompleteApplication.verifyReturnsToApplication(
            applicationReference
          )
          await verifyApplianceStatuses(statusesOf(beforeLast))
        })
      }

      it('HETAS rejects the last appliance and every appliance is Rejected', async () => {
        await openApplicationReview()
        await rejectAppliances(
          applicationReference,
          rejectionItems([lastAppliance])
        )

        await verifyApplianceStatuses(statusesOf(appliances))
      })

      if (partiallyReviewed) {
        it('Boundary: rejecting after a partial review keeps the earlier result and nothing else', async () => {
          await ApplicationReview.startApplianceReview(
            nameOf(partiallyReviewed)
          )

          await verifyTaskStatus('Review test reports', 'Passed')
          await verifyTaskStatus('Review technical drawings', 'Not reviewed')
          await verifyTaskStatus('Review conformity mark', 'Not reviewed')
          await verifyTaskStatus('Review instruction manual', 'Not reviewed')
          await verifyTaskStatus('Check appliance details', 'Not completed')
          await verifyTaskStatus('Check permitted fuels', 'Not completed')
          await verifyTaskStatus('Enter additional conditions', 'Not completed')
        })
      }
    })

    describe('Steps 3 to 5: outcome page and finishing the review', () => {
      labelSeverity('critical')

      it('Step 3: Continue shows every appliance as unsuitable and nothing to submit', async () => {
        await openApplicationReview()
        await ApplicationReview.continueToNextStep()

        await Outcome.verifyPageLoaded()
        const listed = await Outcome.getAllListedAppliances()
        expect([...listed].sort()).toEqual(namesOf(appliances).sort())
        await expect($('main')).toHaveText(ALL_REJECTED_INTRO, {
          containing: true
        })
        await Outcome.verifyUnsuitableAdviceShown()
        await Outcome.verifyAllRejectedOutcome()
      })

      it('Step 4: Return to application opens the application review with every decision kept', async () => {
        await Outcome.returnToApplicationReview()

        await ApplicationReview.verifyPageLoaded(applicationReference)
        await verifyApplianceStatuses(statusesOf(appliances))
      })

      it('Step 5: Continue and Finish review completes the review', async () => {
        await ApplicationReview.continueToNextStep()
        await Outcome.verifyPageLoaded()
        await Outcome.verifyAllRejectedOutcome()

        await Outcome.finishReview()

        await Complete.verifyPageLoaded(applicationReference)
        completionUrl = await browser.getUrl()
      })

      if (isPrimary) {
        it('Negative: finishing the review a second time creates no duplicate records', async () => {
          await browser.back()
          if (await Outcome.finishReviewLink.isExisting()) {
            await Outcome.finishReview()
          }
        })
      }
    })

    describe('Step 6: completion page links', () => {
      labelSeverity('critical')

      beforeEach(async () => {
        await openCompletion()
        await Complete.verifyPageLoaded(applicationReference)
      })

      it('All three links are offered and the records and dashboard links point to the right pages', async () => {
        await Complete.verifyThreeLinks(completionLinkPaths)
      })

      if (isPrimary) {
        knownDefect(KNOWN_DEFECTS.completeApplicationsLink, async () => {
          await Complete.returnToApplianceApplications()

          await Applications.verifyPageLoaded()
        })
      }

      it('Go to appliance records opens the list with the rejected appliances', async () => {
        await Complete.goToApplianceRecords()

        await Records.verifyPageLoaded()
        for (const { modelName } of appliances) {
          await Records.search(modelName)
          await Records.verifyRecordListedByName(modelName)
        }
      })

      it('Return to dashboard opens the dashboard', async () => {
        await Complete.returnToDashboard()

        await Dashboard.verifyPageLoaded()
        await Dashboard.verifyAppliancesSectionLoaded()
      })
    })

    describe('Step 7: downstream records and government queues', () => {
      labelSeverity('critical')

      it('Each appliance has one Rejected record with who and when, and no government history', async () => {
        for (const appliance of appliances) {
          await verifyRejectedRecord({
            modelName: appliance.modelName,
            applianceName: nameOf(appliance),
            applicationReference,
            reviewer
          })
        }
      })

      it('Negative: no appliance is pending, certified or awaiting a decision from any country', async () => {
        for (const { modelName } of appliances) {
          await verifyOnlyRejectedRecord(modelName)
        }
      })

      it('The application has left both the New and In progress lists', async () => {
        await verifyApplicationClosed(applicationReference)
      })

      it('Negative: filtering the records by Pending, Live or Hidden finds none of the appliances, and Rejected finds each once', async () => {
        for (const { modelName } of appliances) {
          await verifyOnlyInRejectedQueue(modelName)
        }
      })

      it('The finished application can still be opened and keeps every appliance Rejected', async () => {
        await openApplicationReview()

        await ApplicationReview.verifyPageLoaded(applicationReference)
        await verifyApplianceStatuses(statusesOf(appliances))
      })

      if (isPrimary) {
        // Opens the record of the first appliance
        const openRejectedRecord = async () => {
          const [appliance] = appliances
          await findRecord(appliance.modelName)
          await Records.viewByName(appliance.modelName)
          await Record.verifyPageLoaded(nameOf(appliance))
        }

        it('Boundary: the Test results page of a rejected record opens for that appliance', async () => {
          await openRejectedRecord()

          await Record.verifyDetailPageOpens('Test results', {
            path: '/test-results',
            heading: `Test results for ${nameOf(appliances[0])}`
          })
        })

        it('Boundary: the Instruction manual page of a rejected record opens for that appliance', async () => {
          await openRejectedRecord()

          await Record.verifyDetailPageOpens('Instruction manual', {
            path: '/instruction-manual',
            heading: `Instruction manual for ${nameOf(appliances[0])}`
          })
        })

        // Registered here, not in a nested suite: Mocha runs nested suites after a suite's own tests
        knownDefect(KNOWN_DEFECTS.rejectedApplianceDetailsError, async () => {
          await openRejectedRecord()

          await Record.verifyDetailPageOpens('Appliance details', {
            path: '/appliance-details',
            heading: 'Appliance details'
          })
        })

        knownDefect(KNOWN_DEFECTS.rejectedApplicationDetailsError, async () => {
          await openRejectedRecord()

          const label = `Application ${applicationReference} details`
          await Record.verifyDetailPageOpens(label, {
            path: '/application-details',
            heading: label
          })
        })
      }
    })
  })
}
