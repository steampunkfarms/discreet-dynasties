import { TwitterApi } from 'twitter-api-v2'

export interface XPostResult {
  id: string
}

export async function postToX(content: string): Promise<XPostResult> {
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

  const tweet = await client.v2.tweet(content)
  return { id: tweet.data.id }
}

export function isXEnabled(): boolean {
  return process.env.TWITTER_ENABLED?.trim() !== 'false'
    && !!(process.env.TWITTER_API_KEY?.trim())
    && !!(process.env.TWITTER_API_SECRET?.trim())
    && !!(process.env.TWITTER_ACCESS_TOKEN?.trim())
    && !!(process.env.TWITTER_ACCESS_SECRET?.trim())
}
