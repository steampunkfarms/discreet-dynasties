import { postToFacebook, postPhotoToFacebook, commentOnFacebook, isFacebookEnabled } from './facebook'
import { postToInstagram, isInstagramEnabled } from './instagram'
import { postToX, replyOnX, isXEnabled } from './x'
export { pickImage } from './image-picker'
import { callModel } from '@/lib/ai-models'
import { sanitizePlaceholders, enforceLength } from '@/lib/ai/sanitize'
import { extractFromAccidentalJson, parseAIJson } from '@/lib/ai/parse-json'

export interface SocialDispatchResult {
  platform: string
  status: 'posted' | 'failed' | 'skipped'
  platformId?: string
  error?: string
}

export interface PlatformContent {
  facebook?: string
  instagram?: string
  x?: string
}

export async function dispatchToAll(content: PlatformContent, imageUrl?: string): Promise<SocialDispatchResult[]> {
  const results: SocialDispatchResult[] = []

  // Validation chain: extractFromAccidentalJson → sanitizePlaceholders → enforceLength → min-length
  const clean = {
    facebook: content.facebook ? enforceLength(sanitizePlaceholders(extractFromAccidentalJson(content.facebook)), 'facebook') : undefined,
    instagram: content.instagram ? enforceLength(sanitizePlaceholders(extractFromAccidentalJson(content.instagram)), 'instagram') : undefined,
    x: content.x ? enforceLength(sanitizePlaceholders(extractFromAccidentalJson(content.x)), 'x') : undefined,
  }

  // Min-length guard: reject content that's too short after sanitization
  if (clean.facebook && clean.facebook.length < 20) {
    console.error(`[dispatch] Facebook copy too short after sanitization (${clean.facebook.length} chars). Skipping.`)
    clean.facebook = undefined
  }
  if (clean.x && clean.x.length < 20) {
    console.error(`[dispatch] X copy too short after sanitization (${clean.x.length} chars). Skipping.`)
    clean.x = undefined
  }
  if (clean.instagram && clean.instagram.length < 20) {
    console.error(`[dispatch] Instagram copy too short after sanitization (${clean.instagram.length} chars). Skipping.`)
    clean.instagram = undefined
  }

  // Facebook — use photo post when imageUrl is available for better reach
  if (clean.facebook && isFacebookEnabled()) {
    try {
      const result = imageUrl
        ? await postPhotoToFacebook(clean.facebook, imageUrl)
        : await postToFacebook(clean.facebook)
      results.push({ platform: 'facebook', status: 'posted', platformId: result.id })
    } catch (err) {
      results.push({ platform: 'facebook', status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' })
    }
  } else if (content.facebook) {
    results.push({ platform: 'facebook', status: 'skipped', error: 'Not configured' })
  }

  // Instagram — requires image
  if (clean.instagram && isInstagramEnabled() && imageUrl) {
    try {
      const result = await postToInstagram(clean.instagram, imageUrl)
      results.push({ platform: 'instagram', status: 'posted', platformId: result.id })
    } catch (err) {
      results.push({ platform: 'instagram', status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' })
    }
  } else if (content.instagram && isInstagramEnabled()) {
    results.push({ platform: 'instagram', status: 'skipped', error: 'Image required for IG feed posts' })
  } else if (content.instagram) {
    results.push({ platform: 'instagram', status: 'skipped', error: 'Not configured' })
  }

  // X (Twitter) — pass imageUrl for media attachment
  if (clean.x && isXEnabled()) {
    try {
      const result = await postToX(clean.x, imageUrl)
      results.push({ platform: 'x', status: 'posted', platformId: result.id })
    } catch (err) {
      results.push({ platform: 'x', status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' })
    }
  } else if (content.x) {
    results.push({ platform: 'x', status: 'skipped', error: 'Not configured' })
  }

  return results
}

export interface FirstCommentResult {
  platform: string
  status: 'posted' | 'failed' | 'skipped'
  commentId?: string
  commentText?: string
  error?: string
}

export async function postFirstComments(
  dispatchResults: SocialDispatchResult[],
  postSlug: string,
  postTitle: string,
  postExcerpt?: string,
): Promise<FirstCommentResult[]> {
  const articleUrl = `https://discreet.tronboll.us/dispatches/${postSlug}`
  const results: FirstCommentResult[] = []

  const prompt = `You are the editorial voice of Discreet Dynasties. Write a single brief first-comment to post as a reply to your own social media post about this dispatch.

Title: "${postTitle}"
${postExcerpt ? `Excerpt: ${postExcerpt}` : ''}
Article URL: ${articleUrl}

Requirements:
- One or two sentences max — a brief thought that extends or reflects on the core idea, then the link
- Vary the phrasing each time — never use "Read more" or "Check out" or "Link in bio"
- Tie the comment to the specific idea in this dispatch, not generic engagement bait
- End with the URL on its own line
- No hashtags, no emojis
- Tone: measured, discreet, the author adding one quiet thought after publishing

Return JSON only (no markdown fences):
{ "comment": "..." }`

  let commentText: string
  try {
    const result = await callModel('claude', prompt)
    if (result.status !== 'success') {
      return dispatchResults
        .filter(r => r.status === 'posted' && r.platformId)
        .map(r => ({ platform: r.platform, status: 'failed' as const, error: `AI gen failed: ${result.error}` }))
    }
    const parsed = parseAIJson<{ comment: string }>(result.text)
    if (!parsed?.comment) {
      return dispatchResults
        .filter(r => r.status === 'posted' && r.platformId)
        .map(r => ({ platform: r.platform, status: 'failed' as const, error: 'AI returned unparseable comment JSON' }))
    }
    commentText = parsed.comment
  } catch (err) {
    return dispatchResults
      .filter(r => r.status === 'posted' && r.platformId)
      .map(r => ({ platform: r.platform, status: 'failed' as const, error: `Comment gen error: ${err instanceof Error ? err.message : 'Unknown'}` }))
  }

  for (const r of dispatchResults) {
    if (r.status !== 'posted' || !r.platformId) continue

    try {
      if (r.platform === 'facebook') {
        const fc = await commentOnFacebook(r.platformId, commentText)
        results.push({ platform: 'facebook', status: 'posted', commentId: fc.id, commentText })
      } else if (r.platform === 'x') {
        const fc = await replyOnX(r.platformId, commentText)
        results.push({ platform: 'x', status: 'posted', commentId: fc.id, commentText })
      } else {
        results.push({ platform: r.platform, status: 'skipped', error: 'First comment not supported on this platform' })
      }
    } catch (err) {
      results.push({
        platform: r.platform,
        status: 'failed',
        commentText,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return results
}

export { isFacebookEnabled, isInstagramEnabled, isXEnabled }
