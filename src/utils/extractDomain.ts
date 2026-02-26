/**
 * Extracts the domain from a URL
 * @param url - The full URL to extract domain from
 * @returns The domain name
 */
export const extractDomain = (url: string): string => {
  try {
    // Add protocol if missing for proper URL parsing
    let processedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      processedUrl = "https://" + url;
    }

    const urlObj = new URL(processedUrl);
    return urlObj.hostname.replace("www.", "");
  } catch (error) {
    // If URL parsing fails, try to extract domain manually
    const domainMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    if (domainMatch) {
      return domainMatch[1];
    }
    return url;
  }
};
