/**
 * Remove template placeholders that AI models sometimes emit.
 */
export function sanitizePlaceholders(text: string): string {
  return text
    .replace(/\[(?:your\s+)?(?:website\s+)?(?:link|url)(?:\s+here)?\]/gi, '')
    .replace(/\((?:your\s+)?(?:insert\s+)?(?:website\s+)?(?:link|url)(?:\s+here)?\)/gi, '')
    .replace(/<(?:your\s+)?(?:website\s+)?(?:link|url)(?:\s+here)?>/gi, '')
    .replace(/\[(?:our\s+)?(?:the\s+)?(?:website|gallery|site|shop|store)\]/gi, 'our website')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Hard truncate text to platform character limits before dispatch.
 */
export function enforceLength(text: string, platform: string): string {
  const limits: Record<string, number> = {
    facebook: 63206,   // FB post limit
    x: 25000,          // Premium/Premium+ limit
    x_twitter: 25000,  // alias for backward compat
    instagram: 2200,
  }
  const max = limits[platform.toLowerCase()] || 5000
  if (text.length <= max) return text
  return text.substring(0, max - 3) + '...'
}
