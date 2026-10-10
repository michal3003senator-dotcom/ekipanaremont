import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/** Reguły limitów (CLAUDE.md: logowanie, rejestracja, formularze, forum, giełda). */
export const LIMITS = {
  login: { points: 10, windowSeconds: 15 * 60 },
  loginEmail: { points: 5, windowSeconds: 15 * 60 },
  register: { points: 5, windowSeconds: 60 * 60 },
  passwordReset: { points: 5, windowSeconds: 60 * 60 },
  verifyResend: { points: 3, windowSeconds: 60 * 60 },
  nipLookup: { points: 20, windowSeconds: 60 * 60 },
  panelAction: { points: 120, windowSeconds: 60 },
  upload: { points: 60, windowSeconds: 60 * 60 },
  suggest: { points: 120, windowSeconds: 60 },
  inquiry: { points: 5, windowSeconds: 60 * 60 },
  review: { points: 10, windowSeconds: 60 * 60 },
  phone: { points: 60, windowSeconds: 60 * 60 },
  view: { points: 300, windowSeconds: 60 * 60 },
  lead: { points: 5, windowSeconds: 60 * 60 },
  report: { points: 5, windowSeconds: 60 * 60 },
  appeal: { points: 3, windowSeconds: 60 * 60 },
} as const

export type LimitName = keyof typeof LIMITS
export type LimitResult = { ok: boolean; retryAfterSeconds: number }

const limiters = new Map<LimitName, Ratelimit>()
const memory = new Map<string, number[]>()
let warned = false

function upstash(name: LimitName): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  let limiter = limiters.get(name)
  if (!limiter) {
    const { points, windowSeconds } = LIMITS[name]
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(points, `${windowSeconds} s`),
      prefix: `rl:${name}`,
    })
    limiters.set(name, limiter)
  }
  return limiter
}

/** Licznik w pamięci procesu – lokalnie i w testach. Na Vercel nie chroni (wiele instancji). */
function inMemory(name: LimitName, key: string, now: number): LimitResult {
  const { points, windowSeconds } = LIMITS[name]
  const bucket = `${name}:${key}`
  const hits = (memory.get(bucket) ?? []).filter((at) => at > now - windowSeconds * 1000)
  if (hits.length >= points) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((hits[0]! + windowSeconds * 1000 - now) / 1000),
    }
  }
  memory.set(bucket, [...hits, now])
  return { ok: true, retryAfterSeconds: 0 }
}

/** Sprawdza i zużywa jeden punkt limitu. `key` to skrót (IP, e-mail), nigdy surowa wartość. */
export async function rateLimit(
  name: LimitName,
  key: string,
  now = Date.now(),
): Promise<LimitResult> {
  const limiter = upstash(name)
  if (!limiter) {
    if (process.env.NODE_ENV === 'production' && !warned) {
      warned = true
      console.warn(
        'Limity żądań bez Upstash – ustaw UPSTASH_REDIS_REST_URL i UPSTASH_REDIS_REST_TOKEN.',
      )
    }
    return inMemory(name, key, now)
  }
  const result = await limiter.limit(key)
  return {
    ok: result.success,
    retryAfterSeconds: result.success ? 0 : Math.ceil((result.reset - now) / 1000),
  }
}

/** Tylko testy: czyści liczniki w pamięci. */
export const resetMemoryLimits = () => memory.clear()
