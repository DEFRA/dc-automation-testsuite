import { readFileSync } from 'node:fs'

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Reads a JSON dataset from test/testData and returns its scenarios, each one deep-merged over
 * the file's shared `defaults` block so a scenario only states what makes it different.
 *
 * @param {string} fileName e.g. 'singleApplianceApplication.json'
 * @returns {object[]} one object per scenario
 */
export function loadScenarios(fileName) {
  const path = new URL(`../testData/${fileName}`, import.meta.url)
  const { defaults = {}, scenarios = [] } = JSON.parse(
    readFileSync(path, 'utf8')
  )

  if (scenarios.length === 0) {
    throw new Error(`Dataset ${fileName} contains no scenarios`)
  }

  return scenarios.map((scenario) => mergeDeep(defaults, scenario))
}

/** Merges nested objects key by key; arrays are replaced wholesale. */
export function mergeDeep(base, override) {
  const merged = { ...base }

  for (const [key, value] of Object.entries(override)) {
    merged[key] =
      isPlainObject(value) && isPlainObject(base[key])
        ? mergeDeep(base[key], value)
        : value
  }

  return merged
}

/** Datasets hold real booleans; the DXT pages answer their radios with 'Yes' / 'No'. */
export function booleansToYesNo(value) {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (Array.isArray(value)) {
    return value.map(booleansToYesNo)
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, booleansToYesNo(item)])
    )
  }

  return value
}
