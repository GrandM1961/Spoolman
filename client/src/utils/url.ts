declare global {
  interface Window {
    SPOOLMAN_BASE_PATH: string;
  }
}

/**
 * Returns the base path of the application.
 *
 * If a base path is set, this returns e.g. "/spoolman". If none is set, it returns "".
 *
 * @return {string} The base path of the application. If the `SPOOLMAN_BASE_PATH`
 * window variable is set and not empty, it is returned. Otherwise, the
 * default base path "" is returned.
 */
export function getBasePath(): string {
  if (window.SPOOLMAN_BASE_PATH && window.SPOOLMAN_BASE_PATH.length > 0) {
    return window.SPOOLMAN_BASE_PATH;
  } else {
    return "";
  }
}

/**
 * A function that returns the Spoolman API URL
 * This returns e.g. "/spoolman/api/v1" if the base path is "/spoolman"
 *
 * @return {string} The API URL
 */
export function getAPIURL(): string {
  // If VITE_APIURL is set at build time, use it
  if (import.meta.env.VITE_APIURL) {
    return getBasePath() + import.meta.env.VITE_APIURL;
  }
  // Otherwise use relative URL to the current origin
  return getBasePath() + "/api/v1";
}
