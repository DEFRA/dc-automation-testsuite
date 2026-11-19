/**
 * Field-level validation data for the HETAS appliance review forms, with the messages the admin
 * shows for each case. Values were confirmed against the live admin.
 */

export const characters = (count) => 'a'.repeat(count)

export const testReportFields = [
  { key: 'ratedOutput', label: 'rated output' },
  { key: 'testedOutput', label: 'tested output - rated' },
  { key: 'testedOutputLow', label: 'tested output - low' },
  { key: 'smokeEmission', label: 'smoke emission output - rated' },
  { key: 'smokeEmissionLow', label: 'smoke emission output - low' }
]

export const allTestReportFields = (value) =>
  Object.fromEntries(testReportFields.map(({ key }) => [key, value]))

export const testReportMessages = {
  required: (label) => `Enter the ${label}`,
  notANumber: (label) => `The ${label} must be a number`
}

export const nonNumericValues = [
  ['letters', 'abc'],
  ['a negative number', '-1'],
  ['a comma as the decimal separator', '4,5'],
  ['exponent notation', '1e3'],
  ['a leading plus sign', '+4'],
  ['two decimal points', '4.5.5']
]

export const numericBoundaryValues = [
  ['zero', '0'],
  ['a decimal', '4.5'],
  ['surrounding spaces', ' 4 ']
]

export const manualMessages = {
  title: 'Enter the title of the instruction manual',
  versionChoice: 'Select if you want to include a version',
  versionName: 'Enter a version name or number',
  dateRequired: 'Enter the publication date',
  dateInvalid: 'Publication date must be a real date',
  yearRange: 'Publication date year must be between 1900 and 9999',
  titleLength: 'Title must be 200 characters or less'
}

export const invalidPublicationDates = [
  ['31 February', { day: '31', month: '2', year: '2024' }, 'dateInvalid'],
  ['month 13', { day: '1', month: '13', year: '2024' }, 'dateInvalid'],
  ['day 0', { day: '0', month: '1', year: '2024' }, 'dateInvalid'],
  ['day 32', { day: '32', month: '1', year: '2024' }, 'dateInvalid'],
  ['31 April', { day: '31', month: '4', year: '2024' }, 'dateInvalid'],
  ['29 February in a non-leap year', { day: '29', month: '2', year: '2023' }, 'dateInvalid'],
  ['letters instead of numbers', { day: 'aa', month: 'bb', year: 'cccc' }, 'dateInvalid'],
  ['a two-digit year', { day: '1', month: '3', year: '24' }, 'yearRange'],
  ['the year before the minimum (1899)', { day: '1', month: '1', year: '1899' }, 'yearRange'],
  ['the year after the maximum (10000)', { day: '1', month: '1', year: '10000' }, 'yearRange']
]

export const validPublicationDates = [
  ['the minimum year (1900)', { day: '1', month: '1', year: '1900' }],
  ['the maximum year (9999)', { day: '1', month: '1', year: '9999' }],
  ['a leap day', { day: '29', month: '2', year: '2024' }],
  ['the 31st of a 31-day month', { day: '31', month: '1', year: '2024' }]
]

export const MANUAL_TITLE_LIMIT = 200
export const LONG_TEXT_LIMIT = 1000

export const permittedFuelMessages = {
  required: 'Enter which fuels the appliance is permitted to burn',
  woodAnswer: /^Select if the appliance is .* to burn wood$/,
  tooLong: 'You have 1 character too many'
}

export const additionalConditionMessages = {
  required:
    'Enter additional conditions for use or enter “No additional conditions for use”',
  tooLong: 'You have 1 character too many'
}
