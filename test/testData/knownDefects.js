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
  permittedFuelsTypo: {
    id: 'KD-002',
    summary:
      'The permitted fuels error message misspells "certified" as "cerified"'
  },
  instructionManualNotice: {
    id: 'KD-003',
    summary:
      'The instruction manual notice reads "public listing. for <appliance>." instead of "public listing for <appliance>."'
  },
  reviewHomeBreadcrumb: {
    id: 'KD-004',
    summary:
      'The Home breadcrumb on the appliance review page links to /manage-certifications, which returns 404'
  }
}
