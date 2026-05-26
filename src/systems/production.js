import { BUILDINGS, RESEARCH, ACHIEVEMENTS } from '../utils/constants'

// Returns { resource: rate/sec } accounting for all multipliers
export function calcRates(state) {
  const {
    buildings = {}, researchDone = [], summons = [],
    prestige = {}, achievements = {}, activeBuffs = [],
  } = state

  const raw = {}

  // 1. Building base rates
  for (const [id, def] of Object.entries(BUILDINGS)) {
    const lvl = buildings[id]?.level ?? 0
    if (lvl <= 0) continue
    for (const [res, rate] of Object.entries(def.produces(lvl))) {
      raw[res] = (raw[res] ?? 0) + rate
    }
  }

  // 2. Research multipliers
  let globalMult = 1
  for (const rId of researchDone) {
    const fx = RESEARCH[rId]?.effect
    if (!fx) continue

    if (fx.globalProdMult) globalMult *= fx.globalProdMult

    if (fx.buildingMult) {
      for (const [bId, mult] of Object.entries(fx.buildingMult)) {
        const lvl = buildings[bId]?.level ?? 0
        if (lvl <= 0) continue
        for (const [res, rate] of Object.entries(BUILDINGS[bId].produces(lvl))) {
          // add the delta only (base is already in raw)
          raw[res] = (raw[res] ?? 0) + rate * (mult - 1)
        }
      }
    }

    // Albträume → Seelen conversion
    if (fx.albtraeumeToSeelen && (raw.albtraeume ?? 0) > 0) {
      raw.seelen = (raw.seelen ?? 0) + raw.albtraeume * 0.5
    }

    // Gottlose Essenz synthesises basic resources
    if (fx.essenzSynthese && (raw.gottloseEssenz ?? 0) > 0) {
      const e = raw.gottloseEssenz
      for (const k of ['seelen','knochen','blut','schatten','erinnerungen','asche','wissen']) {
        raw[k] = (raw[k] ?? 0) + e * 0.1
      }
    }
  }

  // 3. Passive summon income
  const summonBonus = (summons.length * 0.02) * (1 + (prestige.count ?? 0) * 0.1)
  raw.seelen = (raw.seelen ?? 0) + summonBonus

  // 4. Prestige multiplier
  const prestigeMult = calcPrestigeMult(prestige.count ?? 0, researchDone)

  // 5. Achievement production bonus
  const achBonus = calcAchBonus(achievements.unlocked ?? [])

  // 6. Active event buff multiplier
  const now = Date.now()
  let buffMult = 1
  for (const b of (activeBuffs ?? [])) {
    if (b.endsAt > now && b.type === 'prodMult') buffMult *= b.value
  }

  // 7. Apply combined multiplier
  const combined = globalMult * prestigeMult * (1 + achBonus) * buffMult
  const total = {}
  for (const [res, rate] of Object.entries(raw)) {
    if (rate > 0) total[res] = rate * combined
  }
  return total
}

export function calcPrestigeMult(count, researchDone = []) {
  if (count === 0) return 1
  let mult = 1 + 0.25 * Math.min(count, 5) + Math.max(0, count - 5) * 0.1
  if (researchDone.includes('aufstiegVorbereitung')) mult *= 1.1
  return mult
}

export function calcAchBonus(unlocked) {
  return unlocked.reduce((sum, id) => {
    const a = ACHIEVEMENTS.find(x => x.id === id)
    return sum + (a?.prodBonus ?? 0)
  }, 0)
}

export function calcOffline(rates, offlineMs, maxMs) {
  const capped = Math.min(offlineMs, maxMs)
  const sec    = capped / 1000
  const gained = {}
  for (const [res, rate] of Object.entries(rates)) {
    if (rate > 0) gained[res] = rate * sec
  }
  return { gained, seconds: sec, wasCapped: offlineMs > maxMs }
}
