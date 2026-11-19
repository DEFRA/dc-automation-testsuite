import allure from '@wdio/allure-reporter'
import { loadApplianceApplications } from '../applicationSubmission/appliance.application.factory.js'
import { submitApplianceApplication } from '../applicationSubmission/appliance.application.submission.js'
import * as data from '../testData/appliance.review.validation.js'
import { KNOWN_DEFECTS } from '../testData/knownDefects.js'
import { knownDefect } from '../utils/knownDefect.js'
import { reviewAndAcceptAppliance, verifyTaskStatus } from '../reviewFlows/appliance.review.flow.js'
import Dashboard from '../page-objects/hetasAdmin/hetas.admin.dashboard.page.js'
import Applications from '../page-objects/hetasAdmin/hetas.admin.applianceApplications.page.js'
import ApplicationReview from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceApplication.page.js'
import ApplianceReview from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceDetail.page.js'
import TestReports from '../page-objects/hetasAdmin/hetas.admin.reviewTestReports.page.js'
import InstructionManual from '../page-objects/hetasAdmin/hetas.admin.reviewInstructionManual.page.js'
import ApplianceDetails from '../page-objects/hetasAdmin/hetas.admin.checkApplianceDetails.page.js'
import PermittedFuel from '../page-objects/hetasAdmin/hetas.admin.permittedFuel.page.js'
import AdditionalConditions from '../page-objects/hetasAdmin/hetas.admin.additionalConditions.page.js'
import IncompleteReview from '../page-objects/hetasAdmin/hetas.admin.incompleteReview.page.js'
import Outcome from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceOutcome.page.js'
import Complete from '../page-objects/hetasAdmin/hetas.admin.reviewApplianceComplete.page.js'
import ErrorSummary from '../page-objects/hetasAdmin/errorSummary.component.js'
import PageNavigation from '../page-objects/hetasAdmin/pageNavigation.component.js'
import Records from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.applianceRecords.page.js'
import Record from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.applianceRecordDetail.page.js'

const DATASET = 'multipleApplianceApplication.json'
const COUNTRIES = ['England', 'Scotland', 'Wales', 'Northern Ireland']
// WDIO reads a test's timeout before it runs, so it has to be set on the suite
const SUITE_TIMEOUT = 900000

// Dashboard counts carry thousands separators, e.g. "3,358"
const toNumber = (text) => Number(text.replaceAll(',', ''))

const labelSeverity = (severity) =>
  beforeEach(() => allure.addSeverity(severity))

/**
 * EAFEA-376-E2E-002 - an application where every appliance is suitable and is submitted for
 * approval. The first dataset scenario also carries the negative, validation, boundary and
 * known-defect checks; every scenario runs the core journey, which covers the appliance-count
 * boundary (two and three appliances). Tests share one application and run in order.
 */
const applications = loadApplianceApplications(DATASET)

for (const [index, application] of applications.entries()) {
  const isPrimary = index === 0

  describe(`EAFEA-376-E2E-002 Multi-appliance all accepted submission (${application.id})`, function () {
    this.timeout(SUITE_TIMEOUT)

    const { appliances } = application
    const modelNames = appliances.map((appliance) => appliance.modelName)
    const applianceNames = []
    const reviewUrls = []
    let applicationReference
    let applicationReviewUrl
    let newApplicationsBefore
    let recordsBefore

    const openApplicationReview = () => browser.url(applicationReviewUrl)

    const openTask = async (taskName, applianceIndex = 0) => {
      await browser.url(reviewUrls[applianceIndex])
      await ApplianceReview.openTask(taskName)
    }

    beforeEach(() => {
      allure.addFeature('HETAS admin - appliance certification')
      allure.addStory('EAFEA-376-E2E-002 Multi-appliance all accepted')
    })

    describe('Setup', () => {
      labelSeverity('critical')

      it('Step 1: precondition - the application has several appliances and the dashboard is available', async () => {
        expect(appliances.length).toBeGreaterThan(1)

        await Dashboard.open()
        await Dashboard.verifyPageLoaded()
        newApplicationsBefore = toNumber(
          await Dashboard.getApplianceNewApplicationsCount()
        )
        recordsBefore = toNumber(await Dashboard.getApplianceRecordsCount())
      })

      it('Step 2: the manufacturer submits the application and it appears as New with every appliance', async () => {
        await submitApplianceApplication(application)

        await Applications.open()
        applicationReference =
          await Applications.waitForApplicationAwaitingReview(modelNames[0])
        await Applications.verifyApplicationAwaitingReview(applicationReference)
        const products =
          await Applications.getNotStartedProducts(applicationReference)
        for (const modelName of modelNames) {
          expect(products).toContain(modelName)
        }

        await Applications.goToDashboard()
        await Dashboard.verifyPageLoaded()
        const count = await Dashboard.getApplianceNewApplicationsCount()
        expect(toNumber(count)).toBeGreaterThan(newApplicationsBefore)
      })

      it('Step 3: HETAS starts the review, is assigned, and every appliance is listed as Not started', async () => {
        await Dashboard.open()
        await Dashboard.goToNewApplianceApplications()
        await Applications.verifyPageLoaded()
        await Applications.startReview(applicationReference)

        await ApplicationReview.verifyPageLoaded(applicationReference)
        applicationReviewUrl = await browser.getUrl()
        for (const modelName of modelNames) {
          applianceNames.push(await ApplicationReview.getApplianceName(modelName))
        }
        const listedNames = await ApplicationReview.getApplianceNames()
        expect([...listedNames].sort()).toEqual([...applianceNames].sort())
        for (const applianceName of applianceNames) {
          const status =
            await ApplicationReview.getApplianceStatus(applianceName)
          expect(status).toBe('Not started')
        }

        // Starting the review moves the application to In progress under the logged-in reviewer
        await ApplicationReview.goToDashboard()
        await Dashboard.goToInProgressApplianceApplications()
        await Applications.verifyApplicationInProgress(applicationReference)
        await Applications.verifyApplicationNotAwaitingReview(
          applicationReference
        )
        const reviewer = await Applications.getReviewer(applicationReference)
        expect(reviewer).not.toBe('')
      })

      it('Step 4: each appliance has its own review page', async () => {
        for (const applianceName of applianceNames) {
          await openApplicationReview()
          await ApplicationReview.startApplianceReview(applianceName)
          await ApplianceReview.verifyPageLoaded(applianceName)
          reviewUrls.push(await browser.getUrl())
        }
        expect(new Set(reviewUrls).size).toBe(appliances.length)
      })
    })

    if (isPrimary) {
      describe('Negative', () => {
        labelSeverity('critical')

        it('accepting an appliance with incomplete tasks is blocked and leaves the others untouched', async () => {
          await browser.url(reviewUrls[0])
          await ApplianceReview.acceptAppliance()

          await IncompleteReview.verifyPageLoaded()
          await IncompleteReview.verifyApplianceCannotBeAccepted(
            applianceNames[0]
          )
          expect(await IncompleteReview.getBlockingReasons()).toEqual([
            'all supporting documents are marked as Passed',
            'all tasks for preparing the public listing are marked as Completed'
          ])
          await IncompleteReview.returnToReview()
          await ApplianceReview.verifyPageLoaded(applianceNames[0])

          await openApplicationReview()
          for (const applianceName of applianceNames) {
            const status =
              await ApplicationReview.getApplianceStatus(applianceName)
            expect(status).toBe('Not started')
          }
        })
      })

      describe('Validation - test reports', () => {
        labelSeverity('normal')

        beforeEach(async () => {
          await openTask('Review test reports')
        })

        const validResults = data.allTestReportFields('4')

        it('shows an error for every field when all are empty', async () => {
          await TestReports.enterTestResults(data.allTestReportFields(''))
          await TestReports.markAsPassed()

          await ErrorSummary.verifyMessages(
            data.testReportFields.map(({ label }) =>
              data.testReportMessages.required(label)
            )
          )
        })

        for (const { key, label } of data.testReportFields) {
          it(`shows an error when only the ${label} is empty`, async () => {
            await TestReports.enterTestResults({ ...validResults, [key]: '' })
            await TestReports.markAsPassed()

            await ErrorSummary.verifyMessages([
              data.testReportMessages.required(label)
            ])
          })
        }

        for (const [description, value] of data.nonNumericValues) {
          it(`rejects ${description} in every field`, async () => {
            await TestReports.enterTestResults(data.allTestReportFields(value))
            await TestReports.markAsPassed()

            await ErrorSummary.verifyMessages(
              data.testReportFields.map(({ label }) =>
                data.testReportMessages.notANumber(label)
              )
            )
          })
        }
      })

      describe('Boundary - test reports', () => {
        labelSeverity('normal')

        beforeEach(async () => {
          await openTask('Review test reports')
        })

        for (const [description, value] of data.numericBoundaryValues) {
          it(`accepts ${description} in every field`, async () => {
            await TestReports.enterTestResults(data.allTestReportFields(value))
            await TestReports.markAsPassed()

            await ApplianceReview.verifyPageLoaded(applianceNames[0])
            await verifyTaskStatus('Review test reports', 'Passed')
          })
        }
      })

      describe('Validation - instruction manual', () => {
        labelSeverity('normal')

        beforeEach(async () => {
          await openTask('Review instruction manual')
        })

        const validDate = { day: '1', month: '1', year: '2024' }
        const noDate = { day: '', month: '', year: '' }

        // choice: undefined leaves the version question unanswered, false answers No, text answers Yes
        const submitManual = async ({ title = 'Manual', choice, date }) => {
          await InstructionManual.enterManualTitle(title)
          if (choice === false) {
            await InstructionManual.skipVersion()
          } else if (choice !== undefined) {
            await InstructionManual.enterVersion(choice)
          }
          await InstructionManual.enterPublicationDate(date)
          await InstructionManual.markAsPassed()
        }

        it('shows an error for each missing answer when nothing is entered', async () => {
          await submitManual({ title: '', date: noDate })

          await ErrorSummary.verifyMessages([
            data.manualMessages.title,
            data.manualMessages.versionChoice,
            data.manualMessages.dateRequired
          ])
        })

        it('asks for the version question and the date when only a title is given', async () => {
          await submitManual({ date: noDate })

          await ErrorSummary.verifyMessages([
            data.manualMessages.versionChoice,
            data.manualMessages.dateRequired
          ])
        })

        it('asks for a version name when Yes is chosen without one', async () => {
          await submitManual({ choice: '', date: validDate })

          await ErrorSummary.verifyMessages([data.manualMessages.versionName])
        })

        it('asks for the publication date when it is left empty', async () => {
          await submitManual({ choice: false, date: noDate })

          await ErrorSummary.verifyMessages([data.manualMessages.dateRequired])
        })

        for (const [description, date, message] of data.invalidPublicationDates) {
          it(`rejects a publication date of ${description}`, async () => {
            await submitManual({ choice: false, date })

            await ErrorSummary.verifyMessages([data.manualMessages[message]])
          })
        }
      })

      describe('Boundary - instruction manual', () => {
        labelSeverity('normal')

        beforeEach(async () => {
          await openTask('Review instruction manual')
        })

        const publish = async ({ title = 'Manual', date }) => {
          await InstructionManual.enterManualTitle(title)
          await InstructionManual.skipVersion()
          await InstructionManual.enterPublicationDate(date)
          await InstructionManual.markAsPassed()
        }

        it(`rejects a title of ${data.MANUAL_TITLE_LIMIT + 1} characters`, async () => {
          await publish({
            title: data.characters(data.MANUAL_TITLE_LIMIT + 1),
            date: { day: '1', month: '1', year: '2024' }
          })

          await ErrorSummary.verifyMessages([data.manualMessages.titleLength])
        })

        it(`accepts a title of ${data.MANUAL_TITLE_LIMIT} characters`, async () => {
          await publish({
            title: data.characters(data.MANUAL_TITLE_LIMIT),
            date: { day: '1', month: '1', year: '2024' }
          })

          await ApplianceReview.verifyPageLoaded(applianceNames[0])
          await verifyTaskStatus('Review instruction manual', 'Passed')
        })

        for (const [description, date] of data.validPublicationDates) {
          it(`accepts a publication date on ${description}`, async () => {
            await publish({ date })

            await ApplianceReview.verifyPageLoaded(applianceNames[0])
            await verifyTaskStatus('Review instruction manual', 'Passed')
          })
        }
      })

      describe('Validation and boundary - permitted fuels', () => {
        labelSeverity('normal')

        beforeEach(async () => {
          await openTask('Check permitted fuels')
        })

        it('requires the permitted fuels text', async () => {
          await PermittedFuel.enterPermittedFuels('')
          await PermittedFuel.markBurnsWoodYes()
          await PermittedFuel.markAsCompleted()

          await ErrorSummary.verifyMessages([
            data.permittedFuelMessages.required
          ])
        })

        it('requires the wood question to be answered', async () => {
          await PermittedFuel.enterPermittedFuels('Wood logs only')
          await PermittedFuel.markAsCompleted()

          const messages = await ErrorSummary.getMessages()
          expect(messages).toHaveLength(1)
          expect(messages[0]).toMatch(data.permittedFuelMessages.woodAnswer)
        })

        it(`rejects ${data.LONG_TEXT_LIMIT + 1} characters of permitted fuels`, async () => {
          await PermittedFuel.enterPermittedFuels(
            data.characters(data.LONG_TEXT_LIMIT + 1)
          )
          await PermittedFuel.markBurnsWoodYes()
          await PermittedFuel.markAsCompleted()

          await ErrorSummary.verifyMessages([data.permittedFuelMessages.tooLong])
        })

        it(`accepts ${data.LONG_TEXT_LIMIT} characters of permitted fuels`, async () => {
          await PermittedFuel.enterPermittedFuels(
            data.characters(data.LONG_TEXT_LIMIT)
          )
          await PermittedFuel.markBurnsWoodYes()
          await PermittedFuel.markAsCompleted()

          await ApplianceReview.verifyPageLoaded(applianceNames[0])
          await verifyTaskStatus('Check permitted fuels', 'Completed')
        })
      })

      describe('Validation and boundary - additional conditions', () => {
        labelSeverity('normal')

        beforeEach(async () => {
          await openTask('Enter additional conditions')
        })

        for (const [description, text] of [
          ['nothing', ''],
          ['only spaces', '   ']
        ]) {
          it(`requires additional conditions when given ${description}`, async () => {
            await AdditionalConditions.enterAdditionalConditions(text)
            await AdditionalConditions.saveAndMarkAsCompleted()

            await ErrorSummary.verifyMessages([
              data.additionalConditionMessages.required
            ])
          })
        }

        it(`rejects ${data.LONG_TEXT_LIMIT + 1} characters`, async () => {
          await AdditionalConditions.enterAdditionalConditions(
            data.characters(data.LONG_TEXT_LIMIT + 1)
          )
          await AdditionalConditions.saveAndMarkAsCompleted()

          await ErrorSummary.verifyMessages([
            data.additionalConditionMessages.tooLong
          ])
        })

        it(`accepts ${data.LONG_TEXT_LIMIT} characters`, async () => {
          await AdditionalConditions.enterAdditionalConditions(
            data.characters(data.LONG_TEXT_LIMIT)
          )
          await AdditionalConditions.saveAndMarkAsCompleted()

          await ApplianceReview.verifyPageLoaded(applianceNames[0])
          await verifyTaskStatus('Enter additional conditions', 'Completed')
        })
      })

      describe('Known defects', () => {
        labelSeverity('minor')

        knownDefect(KNOWN_DEFECTS.multifuelNotProvided, async () => {
          await openTask('Check appliance details')

          const answer = await ApplianceDetails.getApplianceDetail(
            'Is it a multifuel appliance?'
          )
          expect(answer).toBe(appliances[0].multifuel)
        })

        // The second appliance is still untouched, so its wood question is unanswered
        knownDefect(KNOWN_DEFECTS.permittedFuelsTypo, async () => {
          await openTask('Check permitted fuels', 1)
          await PermittedFuel.markAsCompleted()

          const messages = await ErrorSummary.getMessages()
          if (messages.length === 0) {
            throw new Error('The wood question produced no error message')
          }
          expect(messages.join(' ')).not.toContain('cerified')
        })

        knownDefect(KNOWN_DEFECTS.instructionManualNotice, async () => {
          await openTask('Review instruction manual')

          await InstructionManual.verifyPublicListingNotice(applianceNames[0])
        })

        knownDefect(KNOWN_DEFECTS.reviewHomeBreadcrumb, async () => {
          await browser.url(reviewUrls[0])

          const href = await PageNavigation.homeBreadcrumbLink.getAttribute('href')
          expect(href).toBe('/manage-certification')
        })
      })
    }

    describe('Review, accept and submit', () => {
      labelSeverity('critical')

      it('Step 5: HETAS reviews and accepts every appliance but the last', async () => {
        await openApplicationReview()
        for (const [i, applianceName] of applianceNames.slice(0, -1).entries()) {
          await reviewAndAcceptAppliance({
            applicationReference,
            applianceName,
            submitted: appliances[i]
          })
        }

        const last = applianceNames.at(-1)
        expect(await ApplicationReview.getApplianceStatus(last)).not.toBe(
          'Accepted'
        )
      })

      it('Negative: continuing while an appliance is undecided does not offer submission', async () => {
        await openApplicationReview()
        await ApplicationReview.continueToNextStep()

        await expect(Outcome.submitForApprovalLink).not.toBeDisplayed()
      })

      it('Step 6: HETAS reviews and accepts the last appliance and every appliance shows Accepted', async () => {
        await openApplicationReview()
        await reviewAndAcceptAppliance({
          applicationReference,
          applianceName: applianceNames.at(-1),
          submitted: appliances.at(-1)
        })

        for (const applianceName of applianceNames) {
          const status =
            await ApplicationReview.getApplianceStatus(applianceName)
          expect(status).toBe('Accepted')
        }
      })

      it('Step 7: the all-accepted outcome lists every appliance and offers submission', async () => {
        await ApplicationReview.continueToNextStep()

        await Outcome.verifyPageLoaded()
        const listed = await Outcome.getSuitableAppliances()
        expect([...listed].sort()).toEqual([...applianceNames].sort())
        await Outcome.verifyReadyForGovernmentApproval()
      })

      it('Step 8: HETAS submits for approval and the review completes', async () => {
        await Outcome.submitForApproval()

        await Complete.verifyPageLoaded(applicationReference)
      })

      it('Negative: submitting a second time creates no duplicate records', async () => {
        await browser.back()
        if (await Outcome.submitForApprovalLink.isExisting()) {
          await Outcome.submitForApproval()
        }
      })
    })

    describe('Appliance records', () => {
      labelSeverity('critical')

      it('Step 9: each appliance has exactly one Pending record with every country Awaiting decision', async () => {
        for (const modelName of modelNames) {
          await Records.open()
          await Records.verifyPageLoaded()
          await Records.search(modelName)
          await Records.verifyRecordListedByName(modelName)
          expect(await Records.countRowsByName(modelName)).toBe(1)
          await Records.verifyStatusByName(modelName, 'Pending')
          await Records.viewByName(modelName)

          await Record.verifyPageLoaded(modelName)
          await Record.verifyApplianceStatus('Pending government approval')
          for (const country of COUNTRIES) {
            await Record.verifyCountryStatus(country, 'Awaiting decision')
          }
          const reference = await Record.getApplicationReference()
          expect(reference).toBe(applicationReference)
        }
      })

      it('Step 10: the application leaves the application lists and the records count rises', async () => {
        await Applications.open()
        await Applications.verifyApplicationNotAwaitingReview(
          applicationReference
        )
        await Applications.verifyApplicationNotInProgress(applicationReference)

        await Dashboard.open()
        const records = toNumber(await Dashboard.getApplianceRecordsCount())
        expect(records).toBeGreaterThanOrEqual(recordsBefore + appliances.length)
      })
    })
  })
}
