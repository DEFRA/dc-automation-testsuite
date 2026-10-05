import { FORMS_RUNNER_URL } from './service.urls.js'

/**
 * forms-runner keeps a DXT form's answers in a session cookie, so a second journey in the same
 * browser resumes the first one's answers - the address question then renders its
 * "Use a different address" state and the manual-entry button is gone. Drop the cookie so each
 * application starts from an empty form.
 */
export async function resetFormSession() {
  await browser.url(FORMS_RUNNER_URL)
  await browser.deleteCookies()
}
