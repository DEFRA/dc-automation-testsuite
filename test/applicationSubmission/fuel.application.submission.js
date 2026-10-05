import CompanyNamePage from '../page-objects/dxtFormFuel/dxt.fuel.companyName.page.js'
import CompanyBasedInUkPage from '../page-objects/dxtFormFuel/dxt.fuel.companyBasedInUk.page.js'
import CompanyAddressPage from '../page-objects/dxtFormFuel/dxt.fuel.companyAddress.page.js'
import MainContactPage from '../page-objects/dxtFormFuel/dxt.fuel.mainContact.page.js'
import ResponsiblePersonPage from '../page-objects/dxtFormFuel/dxt.fuel.responsiblePerson.page.js'
import CustomerComplaintsPage from '../page-objects/dxtFormFuel/dxt.fuel.customerComplaints.page.js'
import HowDoYouSellFuelPage from '../page-objects/dxtFormFuel/dxt.fuel.howDoYouSellFuel.page.js'
import ManufactureOrRebrandPage from '../page-objects/dxtFormFuel/dxt.fuel.manufactureOrRebrand.page.js'
import FuelDescriptionPage from '../page-objects/dxtFormFuel/dxt.fuel.fuelDescription.page.js'
import FuelWeightPage from '../page-objects/dxtFormFuel/dxt.fuel.fuelWeight.page.js'
import FuelCompositionPage from '../page-objects/dxtFormFuel/dxt.fuel.fuelComposition.page.js'
import SulphurContentPage from '../page-objects/dxtFormFuel/dxt.fuel.sulphurContent.page.js'
import ManufacturingProcessPage from '../page-objects/dxtFormFuel/dxt.fuel.manufacturingProcess.page.js'
import QualityControlSystemPage from '../page-objects/dxtFormFuel/dxt.fuel.qualityControlSystem.page.js'
import OriginalFuelDetailsPage from '../page-objects/dxtFormFuel/dxt.fuel.originalFuelDetails.page.js'
import ChangesToOriginalFuelPage from '../page-objects/dxtFormFuel/dxt.fuel.changesToOriginalFuel.page.js'
import BrandNamePage from '../page-objects/dxtFormFuel/dxt.fuel.brandName.page.js'
import LetterFromManufacturerPage from '../page-objects/dxtFormFuel/dxt.fuel.letterFromManufacturer.page.js'
import TestReportsPage from '../page-objects/dxtFormFuel/dxt.fuel.testReports.page.js'
import DeclarationPage from '../page-objects/dxtFormFuel/dxt.fuel.declaration.page.js'
import CheckAnswersPage from '../page-objects/dxtFormFuel/dxt.fuel.checkAnswers.page.js'
import FormSubmittedPage from '../page-objects/dxtFormFuel/dxt.fuel.formSubmitted.page.js'
import { resetFormSession } from '../page-objects/shared/formSession.js'
import { buildFuelApplication } from './fuel.application.factory.js'

// The pages are exported as instances, so their option constants live on the class behind them
const BUSINESS_TYPES = ManufactureOrRebrandPage.constructor.OPTIONS
const CHANGE_OPTIONS = ChangesToOriginalFuelPage.constructor.OPTIONS

/**
 * Drives the DXT fuel form end to end to create an application in the database.
 *
 * This form is only a means of creating test data, not the system under test, so there are no
 * assertions here beyond the page-loaded checks each page object makes for itself.
 *
 * @param {object} scenario a dataset scenario, passed to buildFuelApplication
 * @returns {Promise<object>} the data submitted, so callers can find the record by company or
 *   brand name - submission returns no reference number
 */
export async function createFuelApplication(scenario) {
  const application = buildFuelApplication(scenario)

  await submitFuelApplication(application)

  return application
}

/**
 * Walks an already-built application through the form. Use this when the data must be
 * inspected or shared before submitting; otherwise use createFuelApplication.
 */
export async function submitFuelApplication(application) {
  await resetFormSession()
  await CompanyNamePage.open()
  await CompanyNamePage.submit(application.companyName)
  await CompanyBasedInUkPage.submit(application.basedInUk)
  await CompanyAddressPage.submit(application.address)
  await MainContactPage.submit(application.contact)
  await ResponsiblePersonPage.submit(application.responsiblePerson)
  await CustomerComplaintsPage.submit(application.complaintsSystem)
  await HowDoYouSellFuelPage.submit(application.saleType)
  await ManufactureOrRebrandPage.submit(application.businessType)

  const isManufacture = application.businessType === BUSINESS_TYPES.MANUFACTURE

  if (isManufacture) {
    await submitManufactureDetails(application)
  } else {
    await submitRebrandDetails(application)
  }

  await BrandNamePage.submit(application.brandNames)

  // The branches rejoin at brand-name but each has its own "email us the documents" page:
  // test reports for Manufacture, the original manufacturer's permission letter for Rebrand
  if (isManufacture) {
    await TestReportsPage.submit()
  } else {
    await LetterFromManufacturerPage.submit()
  }

  await DeclarationPage.submit()
  await CheckAnswersPage.submit(application.confirmationEmail)
  await FormSubmittedPage.verifyPageLoaded()
}

/** The Manufacture branch: the applicant describes the fuel they make themselves. */
async function submitManufactureDetails(application) {
  await FuelDescriptionPage.submit(application.description)
  await FuelWeightPage.submit(application.weight)
  await FuelCompositionPage.submit(application.composition)
  await SulphurContentPage.submit(application.sulphurContent)
  await ManufacturingProcessPage.submit(application.manufacturingProcess)
  await QualityControlSystemPage.submit(application.qualityControlSystem)
}

/** The Rebrand branch: the applicant describes someone else's fuel and any changes to it. */
async function submitRebrandDetails(application) {
  const { changed, explanation } = application.changesToOriginalFuel

  await OriginalFuelDetailsPage.submit(application.originalFuel)
  await ChangesToOriginalFuelPage.submit({
    option:
      changed === 'Yes' ? CHANGE_OPTIONS.CHANGED : CHANGE_OPTIONS.NOT_CHANGED,
    explanation
  })
}
