/**
 * Reusable GOV.UK table within a "... for review" summary card (e.g. "Appliance
 * for review"). Rows have no test attribute, so each row is looked up by its
 * item name - the only stable per-row identity in the DOM. The Action column
 * link text varies by status ("Start review" / "Continue review" / "Edit
 * review"), but reviewItem() clicks whichever link is present regardless of text.
 */
class ReviewItemsTableComponent {
  constructor(cardTitle) {
    this.cardTitle = cardTitle
  }

  //
  // ===== SELECTORS =====
  //

  get card() {
    return $(
      `//h2[@class="govuk-summary-card__title" and normalize-space(text())="${this.cardTitle}"]/ancestor::div[contains(@class,"govuk-summary-card")]`
    )
  }

  //
  // ===== ACTIONS =====
  //

  // The status sits in a tag; its position varies as the live admin adds an ID column
  async getStatus(itemName) {
    const status = await this.card.$(
      `.//td[normalize-space(text())="${itemName}"]/parent::tr//strong`
    )
    return (await status.getText()).trim()
  }

  async reviewItem(itemName) {
    const reviewLink = await this.card.$(
      `.//td[normalize-space(text())="${itemName}"]/parent::tr//a`
    )
    await reviewLink.click()
  }

  // Returns the full item name for a row whose name contains the given text
  async findItemName(partialName) {
    const name = await this.card.$(
      `.//td[contains(normalize-space(.), "${partialName}")]`
    )
    return (await name.getText()).trim()
  }

  async getItemNames() {
    const names = Array.from(await this.card.$$('.//tbody//tr/td[1]'))
    return Promise.all(
      names.map(async (name) => (await name.getText()).trim())
    )
  }

  async getActionLabel(itemName) {
    const reviewLink = await this.card.$(
      `.//td[normalize-space(text())="${itemName}"]/parent::tr//a`
    )
    return (await reviewLink.getText()).trim()
  }
}

export default ReviewItemsTableComponent
