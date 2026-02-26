/**
 * Shortens a URL for display
 * @param url - The URL to shorten
 * @param maxLength - Maximum length of the shortened URL
 * @returns Shortened URL string
 */
export const shortenUrl = (url: string, maxLength: number = 40): string => {
  if (url.length <= maxLength) {
    return url;
  }

  // Try to keep the domain and first part of the path
  try {
    let processedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      processedUrl = "https://" + url;
    }

    const urlObj = new URL(processedUrl);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    const search = urlObj.search;

    // Calculate available space for path
    const availableSpace = maxLength - domain.length - 4; // 4 for "..."

    if (availableSpace <= 0) {
      return domain.substring(0, maxLength - 3) + "...";
    }

    if (search && search.length <= availableSpace) {
      return domain + search;
    }

    if (path.length <= availableSpace) {
      return domain + path;
    }

    // Truncate path
    const truncatedPath = path.substring(0, availableSpace - 3);
    return domain + truncatedPath + "...";
  } catch (error) {
    // If URL parsing fails, just truncate
    return url.substring(0, maxLength - 3) + "...";
  }
};
