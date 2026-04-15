/**
 * Safely parse an AI model response that may contain JSON.
 * Handles markdown code fences, nested wrappers, leading/trailing prose,
 * and { "content": "..." } nesting from Grok.
 *
 * Returns null on failure instead of throwing — callers should log + skip.
 */
export function parseAIJson<T = Record<string, unknown>>(raw: string): T | null {
  // Step 1: Try direct parse
  try {
    return JSON.parse(raw) as T
  } catch { /* continue */ }

  // Step 2: Strip markdown fences and retry
  const fenceStripped = raw.replace(/```json?\n?/gi, '').replace(/```/g, '').trim()
  try {
    return JSON.parse(fenceStripped) as T
  } catch { /* continue */ }

  // Step 3: Extract first JSON object from surrounding prose
  const jsonMatch = fenceStripped.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as T
    } catch { /* continue */ }
  }

  return null
}

/**
 * Detect if text looks like raw JSON/metadata that should never be posted
 * as social copy. Extracts the human-readable content if possible.
 * Port of rescuebarn's extractFromAccidentalJson.
 */
export function extractFromAccidentalJson(text: string): string {
  const trimmed = text.trim()
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return text

  try {
    const parsed = JSON.parse(trimmed)
    if (typeof parsed !== 'object' || parsed === null) return text

    for (const key of ['facebook', 'x', 'instagram', 'cogworks']) {
      if (key in parsed) {
        const val = parsed[key]
        if (typeof val === 'string' && val.length > 0) return val
        if (val && typeof val === 'object') {
          if (typeof val.content === 'string') return val.content
          if (typeof val.text === 'string') return val.text
        }
      }
    }
  } catch {
    const match = trimmed.match(/"facebook"\s*:\s*"((?:[^"\\]|\\.)*)"/)
    if (match?.[1]) {
      return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
    }
  }

  return text
}

/**
 * Extract clean text from Grok wit refinement output.
 * Grok sometimes wraps output in JSON, quotes, or commentary.
 */
export function extractGrokRefinement(raw: string, original: string): string {
  let text = raw.trim()

  text = text.replace(/^["']|["']$/g, '').trim()

  if (text.startsWith('{')) {
    const parsed = parseAIJson<Record<string, string>>(text)
    if (parsed) {
      const extracted = parsed.text || parsed.post || parsed.x || parsed.tweet
      if (typeof extracted === 'string' && extracted.length > 0) text = extracted
    }
  }

  if (text.length < 20) return original

  return text
}
