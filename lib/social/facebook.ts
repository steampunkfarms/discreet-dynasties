export interface FacebookPostResult {
  id: string
}

// Collaborator page ID for Erick Tronboll's personal Facebook page.
// Posts will tag this page via the Graph API tags parameter.
const COLLABORATOR_PAGE_ID = process.env.FB_COLLABORATOR_PAGE_ID?.trim() || '994056767129483'

// Facebook throttles pages that post links — strip all URLs before posting.
function stripUrls(text: string): string {
  return text.replace(/https?:\/\/\S+/gi, '').replace(/\n{3,}/g, '\n\n').trim()
}

export async function postToFacebook(content: string): Promise<FacebookPostResult> {
  const pageId = process.env.META_PAGE_ID?.trim()
  const token = process.env.META_PAGE_ACCESS_TOKEN?.trim()

  if (!pageId || !token) {
    throw new Error('META_PAGE_ID or META_PAGE_ACCESS_TOKEN not set')
  }

  // Guardrail: never post links to Facebook (throttle prevention)
  const safeContent = stripUrls(content)

  // Build post payload — include collaborator tag if configured
  const payload: Record<string, string> = {
    message: safeContent,
    access_token: token,
  }
  if (COLLABORATOR_PAGE_ID) {
    payload.tags = COLLABORATOR_PAGE_ID
  }

  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    // If tagging fails, retry without tags (Facebook may reject tag if permissions aren't set)
    if (COLLABORATOR_PAGE_ID && JSON.stringify(err).includes('tag')) {
      const retryRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: safeContent, access_token: token }),
      })
      if (!retryRes.ok) {
        const retryErr = await retryRes.json().catch(() => ({}))
        throw new Error(`Facebook API error: ${retryRes.status} ${JSON.stringify(retryErr)}`)
      }
      const retryData = await retryRes.json()
      return { id: retryData.id }
    }
    throw new Error(`Facebook API error: ${res.status} ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  return { id: data.id }
}

export function isFacebookEnabled(): boolean {
  return !!(process.env.META_PAGE_ID?.trim() && process.env.META_PAGE_ACCESS_TOKEN?.trim())
}
