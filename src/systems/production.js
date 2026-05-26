import { BUILDINGS, RESEARCH } from '../utils/constants'

// Returns { resourceKey: productionPerSecond } for the current state
export function calcProductionRates(state) {
  const { buildings, researchDone, summons, prestige } = state
  const rates = {}

  // ── Building base production ──────────────────────────────────────────────
  for (const [id, def] of Object.entries(BUILDINGS)) {
    const lvl = buildings[id]?.level ?? 0
    if (lvl <= 0) continue
    const prod = def.produces(lvl)
    for (const [res, rate] of Object.entries(prod)) {
      rates[res] = (rates[res] ?? 0) + rate
    }
  }

  // ── Research multipliers ──────────────────────────────────────────────────
  let globalMult = 1
  for (const rId of researchDone) {
    const r = RESEARCH[rId]
    if (!r?.effect) continue
    if (r.effect.globalProdMult) globalMult *= r.effect.globalProdMult
    if (r.effect.buildingMult) {
      for (const [bId, mult] of Object.entries(r.effect.buildingMult)) {
        const lvl = buildings[bId]?.level ?? 0
        if (lvl <= 0) continue
        const prod = BUILDINGS[bId]?.produces(lvl) ?? {}
        for (const [res, rate] of Object.entries(prod)) {
          // Add the extra from the multiplier (subtract base already counted)
          rates[res] = (rates[res] ?? 0) + rate * (mult - 1)
        }
      }
    }
    // Special: albtraeume → seelen conversion
    if (r.effect.albtraeumeToSeelen && rates.albtraeume) {
      rates.seelen = (rates.seelen ?? 0) + rates.albtraeume * 0.5
    }
    // Special: gottlose Essenz synthesises small amounts of everything
    if (r.effect.essenzSynthese) {
      const essenzRate = rates.gottloseEssenz ?? 0
      if (essenzRate > 0) {
        for (const key of ['seelen','knochen','blut','schatten','erinnerungen','asche','wissen']) {
          rates[key] = (rates[key] ?? 0) + essenzRate * 0.1
        }
      }
    }
  }

  // ── Prestige multiplier ───────────────────────────────────────────────────
  const prestigeMult = getPrestigeProdMult(prestige.count, researchDone)

  // ── Apply global multipliers ──────────────────────────────────────────────
  const total = {}
  for (const [res, rate] of Object.entries(rates)) {
    total[res] = rate * globalMult * prestigeMult
  }

  // Seelen per second via summons
  const summonRate = (summons.length * 0.02) * (1 + prestige.count * 0.1)
  total.seelen = (total.seelen ?? 0) + summonRate

  return total
}

export function getPrestigeProdMult(count, researchDone = []) {
  if (count === 0) return 1
  const base = Math.min(count, 5)
  // Each prestige step: 1 + 0.25 * base (caps at ×2 for count 5, then linear after)
  let mult = 1 + 0.25 * base + Math.max(0, count - 5) * 0.1
  // Research bonus
  if (researchDone.includes('aufstiegVorbereitung')) mult *= 1.1
  return mult
}

export function calcOfflineProduction(rates, offlineMs, maxOfflineMs) {
  const cappedMs = Math.min(offlineMs, maxOfflineMs)
  const seconds  = cappedMs / 1000
  const result   = {}
  for (const [res, rate] of Object.entries(rates)) {
    if (rate > 0) result[res] = rate * seconds
  }
  return { gained: result, seconds: cappedMs / 1000, cappedAt: offlineMs > maxOfflineMs }
}
