/**
 * Review test reports for {appliance} - reached via the "Review test reports"
 * task on the appliance review detail page (e.g. /1083/CS200i/review-test-reports).
 * Note: "Mark as failed" and "Cancel" are plain links outside the <form>, so
 * they do not submit the entered test result values - only "Mark as passed" does.
 */
class ReviewTestReportsPage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  // Dedicated, label-paired form field ids
  get ratedOutputInput() {
    return $('#ratedOutput')
  }

  get testedOutputInput() {
    return $('#testedOutputRated')
  }

  get testedOutputLowInput() {
    return $('#testedOutputLow')
  }

  get smokeEmissionInput() {
    return $('#smokeEmissionOutputRated')
  }

  get smokeEmissionLowInput() {
    return $('#smokeEmissionOutputLow')
  }

  get markAsPassedButton() {
    return $('button=Mark as passed')
  }

  get markAsFailedLink() {
    return $(
      '//*[self::a or self::button][normalize-space(.)="Mark as failed"]'
    )
  }

  get cancelLink() {
    return $('a=Cancel')
  }

  //
  // ===== ACTIONS =====
  //

  async enterTestResults({
    ratedOutput,
    testedOutput,
    testedOutputLow,
    smokeEmission,
    smokeEmissionLow
  }) {
    await this.ratedOutputInput.setValue(ratedOutput)
    await this.testedOutputInput.setValue(testedOutput)
    await this.testedOutputLowInput.setValue(testedOutputLow)
    await this.smokeEmissionInput.setValue(smokeEmission)
    await this.smokeEmissionLowInput.setValue(smokeEmissionLow)
  }

  async markAsPassed() {
    await this.markAsPassedButton.click()
  }

  async markAsFailed() {
    await this.markAsFailedLink.click()
  }

  async cancel() {
    await this.cancelLink.click()
  }

  //
  // ===== ASSERTIONS =====
  //

  async verifyPageLoaded(applianceName) {
    await expect(this.pageHeading).toHaveText(
      `Review test reports for ${applianceName}`
    )
  }

  //
  // ===== NAVIGATION =====
  //

  open(applicationReference, applianceCode) {
    return browser.url(
      `/admin/iteration-2/${applicationReference}/${applianceCode}/review-test-reports`
    )
  }
}

export default new ReviewTestReportsPage()
