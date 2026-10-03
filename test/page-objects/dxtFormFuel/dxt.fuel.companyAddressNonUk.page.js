import DxtFuelTextareaPageComponent from './dxtFuelTextareaPage.component.js'

/**
 * DXT fuel form - "Company address (non-UK)". Shown instead of the postcode lookup when the
 * company has no UK address; the whole address is captured in a single free-text area.
 * Hint: "Include the street address and the country"
 */
export default new DxtFuelTextareaPageComponent(
  'company-address-non-uk',
  'Company address (non-UK)',
  'uCHKMq'
)
