export interface InstagramPostResult {
  id: string
}

export async function postToInstagram(content: string, imageUrl: string): Promise<InstagramPostResult> {
  const userId = process.env.INSTAGRAM_USER_ID?.trim()
  const token = process.env.META_PAGE_ACCESS_TOKEN?.trim()

  if (!userId || !token) {
    throw new Error('INSTAGRAM_USER_ID or META_PAGE_ACCESS_TOKEN not set')
  }

  // Step 1: Create media container
  const createRes = await fetch(`https://graph.facebook.com/v24.0/${userId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      caption: content,
      image_url: imageUrl,
      access_token: token,
    }),
  })

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}))
    throw new Error(`Instagram media create error: ${createRes.status} ${JSON.stringify(err)}`)
  }

  const { id: containerId } = await createRes.json()

  // Step 2: Publish
  const publishRes = await fetch(`https://graph.facebook.com/v24.0/${userId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: token,
    }),
  })

  if (!publishRes.ok) {
    const err = await publishRes.json().catch(() => ({}))
    throw new Error(`Instagram publish error: ${publishRes.status} ${JSON.stringify(err)}`)
  }

  const data = await publishRes.json()
  return { id: data.id }
}

export function isInstagramEnabled(): boolean {
  return process.env.INSTAGRAM_ENABLED?.trim() === 'true'
    && !!(process.env.INSTAGRAM_USER_ID?.trim())
    && !!(process.env.META_PAGE_ACCESS_TOKEN?.trim())
}
