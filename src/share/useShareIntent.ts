/**
 * Share Intent Hook
 *
 * Re-exports the share intent hook from ShareIntentProvider for convenience.
 * The actual share intent listening is handled by the ShareIntentProvider component.
 *
 * This module provides:
 * - useSharedLink: Access the current shared URL and manipulation functions
 *
 * @example
 * ```typescript
 * // Using useSharedLink to access the current shared URL
 * const { sharedUrl, clearSharedUrl } = useSharedLink();
 * ```
 */

export { useSharedLink, useShareIntent } from "./ShareIntentProvider";
