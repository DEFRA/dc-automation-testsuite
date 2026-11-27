import {
  COUNTRIES,
  REJECTION_DATE_PATTERN,
  historyActions,
  listStatus,
  recordStatus
} from '../testData/appliance.outcome.messages.js'
import Applications from '../page-objects/hetasAdmin/hetas.admin.applianceApplications.page.js'
import Records from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.applianceRecords.page.js'
import Record from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.applianceRecordDetail.page.js'
import History from '../page-objects/devolvedAdminAlternatePath/devolved.admin.alt.actionHistory.page.js'

/**
 * Downstream record checks shared by journeys that finish an application review.
 */

/** Finds the appliance on the records list by its model name and checks it is listed once. */
export async function findRecord(modelName) {
  await Records.open()
  await Records.verifyPageLoaded()
  await Records.search(modelName)
  await Records.verifyRecordListedByName(modelName)
  expect(await Records.countRowsByName(modelName)).toBe(1)
}

/** The appliance has no record outside Rejected, so it is in no government queue. */
export async function verifyOnlyRejectedRecord(modelName) {
  await findRecord(modelName)
  expect(await Records.getStatusesByName(modelName)).toEqual([
    listStatus.rejected
  ])
}

// The list's status filters other than Rejected: Pending is the government approval queue
const NON_REJECTED_QUEUES = ['Pending', 'Live', 'Hidden']

/** Filtering the list by each non-Rejected status finds nothing; filtering by Rejected finds it once. */
export async function verifyOnlyInRejectedQueue(modelName) {
  for (const status of NON_REJECTED_QUEUES) {
    await Records.open()
    await Records.searchByStatus(modelName, status)
    await Records.verifyNoRecordsFound()
  }

  await Records.open()
  await Records.searchByStatus(modelName, listStatus.rejected)
  await Records.verifyRecordListedByName(modelName)
  expect(await Records.countRowsByName(modelName)).toBe(1)
}

/**
 * Checks a rejected appliance's record page and history: Rejected, who and when, the source
 * application, and no trace of governments.
 */
export async function verifyRejectedRecord({
  modelName,
  applianceName,
  applicationReference,
  reviewer
}) {
  await findRecord(modelName)
  await Records.verifyStatusByName(modelName, listStatus.rejected)
  await Records.viewByName(modelName)

  await Record.verifyPageLoaded(applianceName)
  await Record.verifyApplianceStatus(recordStatus.rejected)
  const rejectedBy = await Record.getDetailValue('Rejected by')
  const rejectedOn = await Record.getDetailValue('Date rejected')
  expect(rejectedBy).toBe(reviewer)
  expect(rejectedOn).toMatch(REJECTION_DATE_PATTERN)
  expect(await Record.getApplicationReference()).toBe(applicationReference)

  await verifyNotSentToGovernments()

  const recordUrl = await browser.getUrl()
  await browser.url(`${recordUrl}/action-history`)
  await History.verifyPageLoaded(applianceName)
  await History.verifyActionListed(historyActions.rejected)
  await History.verifyActionNotListed(historyActions.accepted)
  await History.verifyActionNotListed(historyActions.sent)
  expect(await History.getCompletedBy(historyActions.rejected)).toBe(rejectedBy)
  expect(await History.getActionDate(historyActions.rejected)).toBe(rejectedOn)
}

/** On a record page: no certification table, no way to make it live, and no row for any country. */
export async function verifyNotSentToGovernments() {
  await Record.verifyNoCertificationDetails()
  await expect(Record.makeLiveButton).not.toExist()
  for (const country of COUNTRIES) {
    await Record.verifyCountryNotListed(country)
  }
}

/** The application has left both the New and In progress lists. */
export async function verifyApplicationClosed(applicationReference) {
  await Applications.open()
  await Applications.verifyApplicationNotAwaitingReview(applicationReference)
  await Applications.verifyApplicationNotInProgress(applicationReference)
}
