import { postToFacebook, commentOnFacebook, isFacebookEnabled } from './facebook'
import { postToInstagram, isInstagramEnabled } from './instagram'
import { postToX, replyOnX, isXEnabled } from './x'
export { pickImage } from './image-picker'
import { callModel } from '@/lib/ai-models'

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

  // Facebook
  if (content.facebook && isFacebookEnabled()) {
    try {
      const result = await postToFacebook(content.facebook)
      results.push({ platform: 'facebook', status: 'posted', platformId: result.id })
    } catch (err) {
      results.push({ platform: 'facebook', status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' })
    }
  } else if (content.facebook) {
    results.push({ platform: 'facebook', status: 'skipped', error: 'Not configured' })
  }

  // Instagram — requires image
  if (content.instagram && isInstagramEnabled() && imageUrl) {
    try {
      const result = await postToInstagram(content.instagram, imageUrl)
      results.push({ platform: 'instagram', status: 'posted', platformId: result.id })
    } catch (err) {
      results.push({ platform: 'instagram', status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' })
    }
  } else if (content.instagram && isInstagramEnabled()) {
    results.push({ platform: 'instagram', status: 'skipped', error: 'Image required for IG feed posts' })
  } else if (content.instagram) {
    results.push({ platform: 'instagram', status: 'skipped', error: 'Not configured' })
  }

  // X (Twitter)
  if (content.x && isXEnabled()) {
    try {
      const result = await postToX(content.x)
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
    const parsed = JSON.parse(result.text)
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
