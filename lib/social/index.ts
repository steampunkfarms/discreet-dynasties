import { postToFacebook, isFacebookEnabled } from './facebook'
import { postToInstagram, isInstagramEnabled } from './instagram'
import { postToX, isXEnabled } from './x'

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

export async function dispatchToAll(content: PlatformContent): Promise<SocialDispatchResult[]> {
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

  // Instagram
  if (content.instagram && isInstagramEnabled()) {
    // Instagram requires an image — skip for text-only dispatches
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

export { isFacebookEnabled, isInstagramEnabled, isXEnabled }
