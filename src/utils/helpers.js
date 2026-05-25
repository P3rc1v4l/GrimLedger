export const fmt = (n) => {
  const v = Math.floor(n)
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 10_000)    return `${(v / 1_000).toFixed(1)}K`
  return v.toLocaleString('de-DE')
}

export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
export const pick    = (arr) => arr[Math.floor(Math.random() * arr.length)]

export const canAfford = (state, costs) => {
  if (!costs) return false
  for (const [k, v] of Object.entries(costs)) {
    if (k === 'gold' && state.gold < v) return false
    if (k !== 'gold' && (state.materials[k] ?? 0) < v) return false
  }
  return true
}

export const fmtCost = (costs) =>
  Object.entries(costs)
    .map(([k, v]) => `${fmt(v)} ${
      k === 'gold' ? '💰' : k === 'iron' ? '⚙️' : k === 'wood' ? '🪵' :
      k === 'bones' ? '🦴' : k === 'herbs' ? '🌿' : k === 'cloth' ? '🧵' : k
    }`)
    .join(' · ')

export const fmtTime = (ms) => {
  const s = Math.ceil(ms / 1000)
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`
}

export const fmtPlayTime = (ms) => {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
