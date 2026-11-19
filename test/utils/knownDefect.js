import allure from '@wdio/allure-reporter'

const isAssertionFailure = (error) =>
  Boolean(error?.matcherResult) || /^expect/i.test(error?.message ?? '')

/**
 * Registers a test for a defect that is still open.
 *
 * `check` asserts the CORRECT behaviour, so it fails while the defect exists and the test
 * passes. Once the defect is fixed `check` passes and the test fails, prompting its removal.
 * Anything that is not an assertion failure (a missing element, a timeout) still fails the test.
 */
export function knownDefect(defect, check) {
  it(`Known defect ${defect.id}: ${defect.summary}`, async () => {
    allure.addIssue(defect.id)

    let reproduced = false
    try {
      await check()
    } catch (error) {
      if (!isAssertionFailure(error)) {
        throw error
      }
      reproduced = true
    }

    if (!reproduced) {
      throw new Error(
        `${defect.id} no longer reproduces - remove it from knownDefects.js`
      )
    }
  })
}
