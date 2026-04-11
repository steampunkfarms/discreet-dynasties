import { TwitterApi } from 'twitter-api-v2'

export interface XPostResult {
  id: string
}

export async function postToX(content: string, imageUrl?: string): Promise<XPostResult> {
  const apiKey = process.env.TWITTER_API_KEY?.trim()
  const apiSecret = process.env.TWITTER_API_SECRET?.trim()
  const accessToken = process.env.TWITTER_ACCESS_TOKEN?.trim()
  const accessSecret = process.env.TWITTER_ACCESS_SECRET?.trim()

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    throw new Error('Twitter API credentials not set')
  }

  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken,
    accessSecret,
  })

  // Upload image if provided, fall back to text-only on failure
  let mediaIds: string[] | undefined
  if (imageUrl) {
    try {
      const imgResponse = await fetch(imageUrl)
      if (imgResponse.ok) {
        const buffer = Buffer.from(await imgResponse.arrayBuffer())
        const contentType = imgResponse.headers.get('content-type') || 'image/jpeg'
        const mediaId = await client.v1.uploadMedia(buffer, { mimeType: contentType })
        mediaIds = [mediaId]
      }
    } catch (err) {
      // Image upload failed — proceed with text-only tweet
      console.warn('[X] Image upload failed, posting text-only:', err instanceof Error ? err.message : err)
    }
  }

  const tweet = await client.v2.tweet(content, mediaIds ? { media: { media_ids: mediaIds as [string] } } : undefined)
  return { id: tweet.data.id }
}

export interface XReplyResult {
  id: string
}

export async function replyOnX(tweetId: string, content: string): Promise<XReplyResult> {
  const apiKey = process.env.TWITTER_API_KEY?.trim()
  const apiSecret = process.env.TWITTER_API_SECRET?.trim()
  const accessToken = process.env.TWITTER_ACCESS_TOKEN?.trim()
  const accessSecret = process.env.TWITTER_ACCESS_SECRET?.trim()

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    throw new Error('Twitter API credentials not set')
  }

  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken,
    accessSecret,
  })

  const reply = await client.v2.reply(content, tweetId)
  return { id: reply.data.id }
}

export function isXEnabled(): boolean {
  return process.env.TWITTER_ENABLED?.trim() !== 'false'
    && !!(process.env.TWITTER_API_KEY?.trim())
    && !!(process.env.TWITTER_API_SECRET?.trim())
    && !!(process.env.TWITTER_ACCESS_TOKEN?.trim())
    && !!(process.env.TWITTER_ACCESS_SECRET?.trim())
}
