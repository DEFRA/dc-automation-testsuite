/**
 * Open defects in the HETAS admin. A spec registers each one with knownDefect(), whose check
 * asserts the correct behaviour - so the entry stays until the defect is fixed and removed here.
 */
export const KNOWN_DEFECTS = {
  multifuelNotProvided: {
    id: 'KD-001',
    summary:
      'Check appliance details shows "Not provided" for the multifuel answer the manufacturer submitted'
  },
  reviewHomeBreadcrumb: {
    id: 'KD-004',
    summary:
      'The Home breadcrumb on the appliance review page links to /manage-certifications, which returns 404'
  },
  outcomeSingularWording: {
    id: 'KD-005',
    summary:
      'The finish-review page says "the following appliance is not considered suitable" when several appliances are listed'
  }
}
