/**
 * Share Parser Utility
 *
 * Extracts the first valid URL from raw shared text using regex pattern matching.
 * Supports various URL formats including http, https, and domain-only URLs.
 */

/**
 * Regular expression pattern for matching URLs
 * Matches:
 * - http:// URLs
 * - https:// URLs
 * - Domain-only URLs (e.g., example.com)
 * - URLs with paths, query parameters, and fragments
 */
const URL_REGEX =
  /(?:https?:\/\/)?(?:[\w-]+\.)+[a-zA-Z]{2,}(?:\/[\w\-./?%&=]*)?/gi;

/**
 * Extracts the first valid URL from raw shared text
 *
 * @param rawText - The raw text content from a share intent
 * @returns The first valid URL found, or null if no valid URL exists
 *
 * @example
 * // Returns "https://youtube.com/watch?v=abc123"
 * parseShareText("Check out this video https://youtube.com/watch?v=abc123 shared via app");
 *
 * @example
 * // Returns "https://reddit.com/r/reactnative"
 * parseShareText("Hey check out this subreddit: https://reddit.com/r/reactnative");
 *
 * @example
 * // Returns null (no valid URL)
 * parseShareText("Just some random text without any URL");
 */
export function parseShareText(rawText: string): string | null {
  // Guard against empty or non-string input
  if (!rawText || typeof rawText !== "string") {
    return null;
  }

  // Trim whitespace from the input
  const trimmedText = rawText.trim();

  if (trimmedText.length === 0) {
    return null;
  }

  // Find all URL matches in the text
  const matches = trimmedText.match(URL_REGEX);

  if (!matches || matches.length === 0) {
    return null;
  }

  // Return the first valid URL found
  const firstUrl = matches[0];

  // Ensure the URL has a protocol (https://) if missing
  if (!firstUrl.startsWith("http://") && !firstUrl.startsWith("https://")) {
    return `https://${firstUrl}`;
  }

  return firstUrl;
}

/**
 * Validates if a string is a valid URL
 *
 * @param url - The URL string to validate
 * @returns True if the string is a valid URL, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    // Add protocol if missing for validation
    const urlToValidate =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    new URL(urlToValidate);
    return true;
  } catch {
    return false;
  }
}

export default parseShareText;
