/**
 * Finish application review - reached by clicking "Continue" on the review application page
 * once every appliance has been accepted or rejected. The all-accepted variant lists the suitable
 * appliances only; the mixed variant splits them into "Unsuitable appliances" and "Suitable
 * appliances" sections. Either variant offers "Submit for approval" when at least one is suitable.
 */
class ReviewApplianceOutcomePage {
  //
  // ===== SELECTORS =====
  //

  get pageHeading() {
    return $('h1')
  }

  // Only list inside main - it holds the appliances considered suitable
  get suitableAppliancesList() {
    return $('main ul')
  }

  get suitableAppliances() {
    return $$('main ul li')
  }

  // Wording varies between one and several appliances, so only the shared part is matched
  get governmentsMessage() {
    return $('p*=submitted to the governments')
  }

  get submitForApprovalLink() {
    return $(
      '//*[self::a or self::button][normalize-space(.)="Submit for approval"]'
    )
  }

  get returnToApplicationReviewLink() {
    return $('a*=Return to application')
  }

  // Offered instead of "Submit for approval" when no appliance is suitable
  get finishReviewLink() {
    return $('//*[self::a or self::button][normalize-space(.)="Finish review"]')
  }

  get suitableSectionHeading() {
    return $('//h2[normalize-space(.)="Suitable appliances"]')
  }

  // The mixed variant's text after the unsuitable list
  get unsuitableAdvice() {
    return $('p*=You must contact the applicant')
  }

  getSectionIntro(heading) {
    return $(`//h2[normalize-space(.)="${heading}"]/following-sibling::p[1]`)
  }

  getSectionItems(heading) {
    return $$(
      `//h2[normalize-space(.)="${heading}"]/following-sibling::ul[1]/li`
    )
  }

  //
  // ===== ACTIONS =====
  //

  async submitForApproval() {
    await this.submitForApprovalLink.click()
  }

  async returnToApplicationReview() {
    await this.returnToApplicationReviewLink.click()
  }

  async finishReview() {
    await this.finishReviewLink.click()
  }

  // Every appliance listed on the page, whichever section it sits in
  async getAllListedAppliances() {
    return this.getSuitableAppliances()
  }

  async getSuitableAppliances() {
    const items = Array.from(await this.suitableAppliances)
    return Promise.all(items.map(async (item) => (await item.getText()).trim()))
  }

  async getSectionAppliances(heading) {
    const items = Array.from(await this.getSectionItems(heading))
    return Promise.all(items.map(async (item) => (await item.getText()).trim()))
  }

  async getSectionIntroText(heading) {
    return (await this.getSectionIntro(heading).getText()).trim()
  }

  //
  // ===== ASSERTIONS =====
  //

  // The two variants capitalise the heading differently ("Application Review" / "application review")
  async verifyPageLoaded() {
    await expect(this.pageHeading).toHaveText('Finish application review', {
      ignoreCase: true
    })
  }

  async verifyUnsuitableAdviceShown() {
    await expect(this.unsuitableAdvice).toBeDisplayed()
  }

  async verifyApplianceSuitable(applianceName) {
    await expect(this.suitableAppliancesList).toHaveText(applianceName, {
      containing: true
    })
  }

  // No appliance is suitable: nothing can go to the governments, so the review can only be finished
  async verifyAllRejectedOutcome() {
    await expect(this.finishReviewLink).toBeDisplayed()
    await expect(this.returnToApplicationReviewLink).toBeDisplayed()
    await expect(this.submitForApprovalLink).not.toExist()
    await expect(this.governmentsMessage).not.toExist()
    await expect(this.suitableSectionHeading).not.toExist()
  }

  async verifyReadyForGovernmentApproval() {
    await expect(this.governmentsMessage).toHaveText(
      'England, Scotland, Wales and Northern Ireland',
      { containing: true }
    )
    await expect(this.submitForApprovalLink).toBeDisplayed()
  }

  //
  // ===== NAVIGATION =====
  //

  open(applicationReference) {
    return browser.url(
      `/admin/iteration-2/${applicationReference}/review-outcome`
    )
  }
}

export default new ReviewApplianceOutcomePage()
