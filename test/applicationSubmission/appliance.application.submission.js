import CompanyNamePage from '../page-objects/dxtFormAppliance/dxt.appliance.companyName.page.js'
import CompanyBasedInUkPage from '../page-objects/dxtFormAppliance/dxt.appliance.companyBasedInUk.page.js'
import CompanyAddressPage from '../page-objects/dxtFormAppliance/dxt.appliance.companyAddress.page.js'
import MainContactPage from '../page-objects/dxtFormAppliance/dxt.appliance.mainContact.page.js'
import ApplianceDetailsPage from '../page-objects/dxtFormAppliance/dxt.appliance.applianceDetails.page.js'
import ApplianceDetailsSummaryPage from '../page-objects/dxtFormAppliance/dxt.appliance.applianceDetailsSummary.page.js'
import SupportingDocumentsPage from '../page-objects/dxtFormAppliance/dxt.appliance.supportingDocuments.page.js'
import DeclarationPage from '../page-objects/dxtFormAppliance/dxt.appliance.declaration.page.js'
import CheckAnswersPage from '../page-objects/dxtFormAppliance/dxt.appliance.checkAnswers.page.js'
import FormSubmittedPage from '../page-objects/dxtFormAppliance/dxt.appliance.formSubmitted.page.js'
import { resetFormSession } from '../page-objects/shared/formSession.js'
import { buildApplianceApplication } from './appliance.application.factory.js'

/**
 * Drives the DXT appliance form end to end to create an application in the database.
 *
 * This form is only a means of creating test data, not the system under test, so there are no
 * assertions here beyond the page-loaded checks each page object makes for itself.
 *
 * @param {object} scenario a dataset scenario, passed to buildApplianceApplication
 * @returns {Promise<object>} the data submitted, so callers can find the record by company or
 *   model name - submission returns no reference number
 */
export async function createApplianceApplication(scenario) {
  const application = buildApplianceApplication(scenario)

  await submitApplianceApplication(application)

  return application
}

/**
 * Walks an already-built application through the form. Use this when the data must be
 * inspected or shared before submitting; otherwise use createApplianceApplication.
 */
export async function submitApplianceApplication(application) {
  await resetFormSession()
  await CompanyNamePage.open()
  await CompanyNamePage.submit(application.companyName)
  await CompanyBasedInUkPage.submit(application.basedInUk)
  await CompanyAddressPage.submit(application.address)
  await MainContactPage.submit(application.contact)

  await submitApplianceDetails(application.appliances)

  await SupportingDocumentsPage.submit()
  await DeclarationPage.submit()
  await CheckAnswersPage.submit(application.confirmationEmail)
  await FormSubmittedPage.verifyPageLoaded()
}

/**
 * Fills the repeatable "Appliance details" section. Each pass returns to the summary page,
 * where "Add another" starts the next appliance.
 */
async function submitApplianceDetails(appliances) {
  for (const [index, appliance] of appliances.entries()) {
    if (index > 0) {
      await ApplianceDetailsSummaryPage.addAnother()
    }

    await ApplianceDetailsPage.submit(appliance)
  }

  await ApplianceDetailsSummaryPage.verifyPageLoaded()
  await ApplianceDetailsSummaryPage.verifyApplianceCount(appliances.length)
  await ApplianceDetailsSummaryPage.clickContinue()
}
