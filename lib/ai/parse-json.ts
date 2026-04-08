/**
 * Safely parse an AI model response that may contain JSON.
 * Handles markdown code fences, nested wrappers, and leading/trailing prose.
 */
export function parseAIJson<T>(raw: string): T {
  const cleaned = raw.replace(/```json?\n?/gi, '').replace(/```/g, '').trim()
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON object found in AI response')
  const parsed = JSON.parse(jsonMatch[0])
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'text' in parsed &&
    typeof parsed.text === 'string' &&
    Object.keys(parsed).length <= 3
  ) {
    if (!('facebook' in parsed) && !('x' in parsed)) {
      return parsed.text as unknown as T
    }
  }
  return parsed as T
}
