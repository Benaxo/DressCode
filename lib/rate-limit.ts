const DAILY_LIMIT = 20
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getResetTime(): number {
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    return tomorrow.getTime()
}

function cleanupExpired() {
    const now = Date.now()
    for (const [ip, data] of rateLimitMap.entries()) {
        if (now >= data.resetAt) {
            rateLimitMap.delete(ip)
        }
    }
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
    cleanupExpired()
    
    const now = Date.now()
    const record = rateLimitMap.get(ip)
    
    if (!record || now >= record.resetAt) {
        const resetAt = getResetTime()
        rateLimitMap.set(ip, { count: 1, resetAt })
        return { allowed: true, remaining: DAILY_LIMIT - 1, resetAt }
    }
    
    if (record.count >= DAILY_LIMIT) {
        return { allowed: false, remaining: 0, resetAt: record.resetAt }
    }
    
    record.count++
    return { allowed: true, remaining: DAILY_LIMIT - record.count, resetAt: record.resetAt }
}

export function getRateLimitInfo(ip: string): { remaining: number; resetAt: number } {
    const record = rateLimitMap.get(ip)
    if (!record || Date.now() >= record.resetAt) {
        return { remaining: DAILY_LIMIT, resetAt: getResetTime() }
    }
    return { remaining: Math.max(0, DAILY_LIMIT - record.count), resetAt: record.resetAt }
}

