import { randF } from '../utils/helpers'

export function combatRound(summons, bossFight, researchDone = []) {
  if (!summons.length || !bossFight) return null

  const combatMult = researchDone.includes('waechterbindung') ? 1.4 : 1.0
  const godMult    = researchDone.includes('verloreneGoetter')  ? 1.5 : 1.0

  // Player attack
  let atk = 0
  for (const s of summons) {
    const base   = s.stats.atk * combatMult * godMult
    const isCrit = Math.random() < s.stats.crit
    atk += Math.floor(base * (isCrit ? 2 : 1))
  }

  // Boss counterattack — one target
  const bossAtk  = Math.floor(bossFight.atk * randF(0.8, 1.2))
  const avgDef   = summons.reduce((s, u) => s + u.stats.def, 0) / summons.length
  const dmgTaken = Math.max(1, bossAtk - Math.floor(avgDef))

  return { playerDmg: atk, bossDmg: dmgTaken }
}

export function makeBossFight(bossDef) {
  return {
    bossId:   bossDef.id,
    bossName: bossDef.name,
    bossIcon: bossDef.icon,
    maxHp:    bossDef.hp,
    hp:       bossDef.hp,
    atk:      bossDef.atk,
    reward:   bossDef.reward,
    roundTick: 0,
    roundEvery: 10,  // combat resolves every 10 ticks
  }
}
