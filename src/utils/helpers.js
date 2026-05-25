// ── Zahlenformatierung ────────────────────────────────────────────────────────
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj']

export function fmt(n) {
  if (!isFinite(n) || n < 0) return '0'
  if (n < 1000) return Math.floor(n).toString()
  let idx = 0
  let v = n
  while (v >= 1000 && idx < SUFFIXES.length - 1) { v /= 1000; idx++ }
  const digits = v >= 100 ? 1 : v >= 10 ? 2 : 3
  return v.toFixed(digits) + SUFFIXES[idx]
}

export function fmtRate(n) {
  if (n <= 0) return '0/s'
  if (n < 0.01) return '<0.01/s'
  return `${fmt(n)}/s`
}

// ── Random ────────────────────────────────────────────────────────────────────
export const randInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
export const randF    = (min, max) => Math.random() * (max - min) + min
export const pick     = (arr)      => arr[Math.floor(Math.random() * arr.length)]

// ── Cost checks ───────────────────────────────────────────────────────────────
export function canAfford(resources, costs) {
  if (!costs) return false
  for (const [k, v] of Object.entries(costs)) {
    if ((resources[k] ?? 0) < v) return false
  }
  return true
}

export function fmtCost(costs) {
  return Object.entries(costs)
    .map(([k, v]) => `${fmt(v)} ${k}`)
    .join(' · ')
}

// ── Time ──────────────────────────────────────────────────────────────────────
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

// ── Seeded random (for daily quests) ─────────────────────────────────────────
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

export function getTodayStart() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime()
}

export function todaySeed() {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}
