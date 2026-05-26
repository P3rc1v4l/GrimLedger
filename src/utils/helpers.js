// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae', 'af']

export function fmt(n, compact = false) {
  if (!isFinite(n) || n < 0) return '0'
  const v = Math.floor(n)
  if (v < 1000) return v.toString()
  let idx = 0, x = n
  while (x >= 1000 && idx < SUFFIXES.length - 1) { x /= 1000; idx++ }
  const dec = compact ? 0 : x >= 100 ? 1 : x >= 10 ? 2 : 3
  return x.toFixed(dec) + SUFFIXES[idx]
}

export function fmtRate(n) {
  if (n <= 0) return null
  if (n < 0.001) return '<0.001/s'
  if (n < 1) return `${n.toFixed(3)}/s`
  return `${fmt(n)}/s`
}

export function fmtTime(ms) {
  if (ms <= 0) return '0s'
  const s = Math.ceil(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

export function fmtPlayTime(ms) {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function fmtCostObj(costs, resMap) {
  return Object.entries(costs)
    .map(([k, v]) => `${fmt(v)} ${resMap[k]?.icon ?? k}`)
    .join(' · ')
}

export const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
export const randF   = (a, b) => Math.random() * (b - a) + a
export const pick    = (arr)  => arr[Math.floor(Math.random() * arr.length)]
export const clamp   = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export function canAfford(resources, costs) {
  if (!costs || !Object.keys(costs).length) return true  // free
  for (const [k, v] of Object.entries(costs)) {
    if ((resources[k] ?? 0) < v) return false
  }
  return true
}

// Seeded shuffle (Fisher-Yates) for reproducible daily quests
export function seededShuffle(arr, seed) {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function todaySeed() {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

export function getTodayMs() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
