import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('replicate', () => ({
  default: vi.fn().mockImplementation(() => ({
    run: vi.fn().mockResolvedValue(['https://example.com/result.jpg'])
  })),
  FileOutput: vi.fn()
}))

const CLOTHING_CATEGORIES = ["t-shirt", "shirt", "pants", "jeans", "shorts", "dress", "jacket", "coat", "hoodie", "sweater", "top", "bottom", "upper_body", "lower_body"]
const ACCESSORY_CATEGORIES = ["bags", "belts", "scarves", "gloves", "sunglasses", "hat", "watch", "jewelry", "shoes"]

function isClothing(category?: string): boolean {
  if (!category) return true
  const cat = category.toLowerCase()
  return CLOTHING_CATEGORIES.some(c => cat.includes(c)) || !ACCESSORY_CATEGORIES.some(c => cat.includes(c))
}

async function extractImageUrl(output: unknown): Promise<string | null> {
  if (!output) return null
  if (output && typeof output === "object" && "url" in output) {
    const fileOutput = output as { url: string | (() => string) }
    if (typeof fileOutput.url === "function") return fileOutput.url()
    return fileOutput.url
  }
  if (typeof output === "string") return output
  if (Array.isArray(output) && output.length > 0) return extractImageUrl(output[0])
  return null
}

describe('Try-on API logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isClothing function', () => {
    it('returns true for t-shirt category', () => {
      expect(isClothing('t-shirt')).toBe(true)
    })

    it('returns true for pants category', () => {
      expect(isClothing('pants')).toBe(true)
    })

    it('returns true for undefined category (defaults to clothing)', () => {
      expect(isClothing(undefined)).toBe(true)
    })

    it('returns false for bags category', () => {
      expect(isClothing('bags')).toBe(false)
    })

    it('returns false for sunglasses category', () => {
      expect(isClothing('sunglasses')).toBe(false)
    })

    it('returns false for belts category', () => {
      expect(isClothing('belts')).toBe(false)
    })

    it('returns false for scarves category', () => {
      expect(isClothing('scarves')).toBe(false)
    })

    it('returns false for gloves category', () => {
      expect(isClothing('gloves')).toBe(false)
    })

    it('handles case insensitivity', () => {
      expect(isClothing('T-SHIRT')).toBe(true)
      expect(isClothing('BAGS')).toBe(false)
    })
  })

  describe('extractImageUrl function', () => {
    it('extracts URL from string', async () => {
      expect(await extractImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg')
    })

    it('extracts URL from array of strings', async () => {
      expect(await extractImageUrl(['https://example.com/image.jpg'])).toBe('https://example.com/image.jpg')
    })

    it('extracts URL from object with url property', async () => {
      expect(await extractImageUrl({ url: 'https://example.com/image.jpg' })).toBe('https://example.com/image.jpg')
    })

    it('extracts URL from object with url function', async () => {
      expect(await extractImageUrl({ url: () => 'https://example.com/image.jpg' })).toBe('https://example.com/image.jpg')
    })

    it('returns null for null/undefined', async () => {
      expect(await extractImageUrl(null)).toBe(null)
      expect(await extractImageUrl(undefined)).toBe(null)
    })

    it('returns null for empty array', async () => {
      expect(await extractImageUrl([])).toBe(null)
    })
  })
})
