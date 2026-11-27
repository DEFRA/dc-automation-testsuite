import allure from '@wdio/allure-reporter'

/** Labels every test in the enclosing suite with an Allure severity. */
export const labelSeverity = (severity) =>
  beforeEach(() => allure.addSeverity(severity))
