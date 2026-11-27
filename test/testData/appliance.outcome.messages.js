/**
 * Wording and labels on the finish-review and record pages for a mixed application outcome.
 * Intro text is matched loosely because the admin switches between "appliance" and "appliances".
 */

export const OUTCOME_SECTIONS = {
  unsuitable: 'Unsuitable appliances',
  suitable: 'Suitable appliances'
}

export const outcomeIntro = {
  unsuitable:
    /^Following technical review, the following appliances? (?:is|are) not considered to be suitable for certification under the Clean Air Act 1993\.$/,
  suitable:
    /^Following technical review, the following appliances? (?:is|are) considered to be suitable for certification under the Clean Air Act 1993\.$/,
  unsuitablePlural:
    /^Following technical review, the following appliances are not considered to be suitable/
}

export const recordStatus = {
  accepted: 'Pending government approval',
  rejected: 'Rejected'
}

export const listStatus = {
  accepted: 'Pending',
  rejected: 'Rejected'
}

export const historyActions = {
  accepted: 'Accepted at application',
  rejected: 'Rejected at application',
  sent: 'Sent to governments for approval'
}

export const REJECTION_DATE_PATTERN = /^\d{1,2} [A-Za-z]+ \d{4}$/

export const COUNTRIES = ['England', 'Scotland', 'Wales', 'Northern Ireland']

// Shown on the finish-review page when no appliance is suitable
export const ALL_REJECTED_INTRO = /not considered to be suitable/i

export const completionLinkPaths = {
  records: '/appliance-records',
  dashboard: '/manage-certification'
}
