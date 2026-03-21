import { TwitterApi } from 'twitter-api-v2'

export interface PlatformMetrics {
  impressions: number
  engagements: number
  clicks: number
  likes: number
  retweets: number
  replies: number
}

const EMPTY_METRICS: PlatformMetrics = { impressions: 0, engagements: 0, clicks: 0, likes: 0, retweets: 0, replies: 0 }

export async function fetchFacebookMetrics(platformId: string): Promise<PlatformMetrics> {
  const token = process.env.META_PAGE_ACCESS_TOKEN?.trim()
  if (!token) return EMPTY_METRICS

  try {
    const res = await fetch(
      `https://graph.facebook.com/v25.0/${platformId}/insights?metric=post_impressions,post_engagements,post_clicks&access_token=${token}`
    )
    if (!res.ok) return EMPTY_METRICS

    const data = await res.json()
    const metrics = { ...EMPTY_METRICS }

    for (const entry of data.data || []) {
      const value = entry.values?.[0]?.value || 0
      switch (entry.name) {
        case 'post_impressions': metrics.impressions = value; break
        case 'post_engagements': metrics.engagements = value; break
        case 'post_clicks': metrics.clicks = value; break
      }
    }

    return metrics
  } catch {
    return EMPTY_METRICS
  }
}

export async function fetchXMetrics(platformId: string): Promise<PlatformMetrics> {
  const apiKey = process.env.TWITTER_API_KEY?.trim()
  const apiSecret = process.env.TWITTER_API_SECRET?.trim()
  const accessToken = process.env.TWITTER_ACCESS_TOKEN?.trim()
  const accessSecret = process.env.TWITTER_ACCESS_SECRET?.trim()

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) return EMPTY_METRICS

  try {
    const client = new TwitterApi({ appKey: apiKey, appSecret: apiSecret, accessToken, accessSecret })
    const tweet = await client.v2.singleTweet(platformId, { 'tweet.fields': ['public_metrics'] })
    const pm = tweet.data.public_metrics

    return {
      impressions: pm?.impression_count || 0,
      engagements: (pm?.like_count || 0) + (pm?.retweet_count || 0) + (pm?.reply_count || 0),
      clicks: 0,
      likes: pm?.like_count || 0,
      retweets: pm?.retweet_count || 0,
      replies: pm?.reply_count || 0,
    }
  } catch {
    return EMPTY_METRICS
  }
}

export async function fetchPlatformMetrics(platform: string, platformId: string): Promise<PlatformMetrics> {
  switch (platform) {
    case 'facebook': return fetchFacebookMetrics(platformId)
    case 'x': return fetchXMetrics(platformId)
    default: return EMPTY_METRICS
  }
}
