/**
 * Hosts for the services the suite drives.
 *
 * The DXT form is a separate deployment from the site under test, so its page objects build
 * absolute URLs instead of relying on the config's single `baseUrl`.
 */
export const FORMS_RUNNER_URL =
  process.env.FORMS_RUNNER_URL ??
  'https://forms-runner.test.cdp-int.defra.cloud'
