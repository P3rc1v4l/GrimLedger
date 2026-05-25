import { randF, randInt } from '../utils/helpers'

// Simulate one combat round (call repeatedly via tick)
// Returns { log entries, damage dealt to boss, damage taken }
export function combatTick(summons, boss, researchDone = []) {
  if (!summons.length || !boss) return null

  const combatMult = researchDone.includes('waechterbindung') ? 1.4 : 1.0
  const godBonus   = researchDone.includes('verloreneGoetter')  ? 1.5 : 1.0

  let totalAtk = 0
  for (const s of summons) {
    const base = s.stats.atk * combatMult * godBonus
    const isCrit = Math.random() < s.stats.crit
    totalAtk += base * (isCrit ? 2.0 : 1.0)
  }
  totalAtk = Math.floor(totalAtk)

  // Boss counter-attack — shared across all summons
  const bossAtk = Math.floor(boss.atk * randF(0.8, 1.2))
  const summonDef = summons.reduce((s, u) => s + u.stats.def, 0) / summons.length
  const dmgTaken  = Math.max(1, bossAtk - Math.floor(summonDef))

  return { playerDmg: totalAtk, bossDmg: dmgTaken }
}

// Build a fresh boss fight state
export function startBossFight(bossDef) {
  return {
    bossId: bossDef.id,
    bossName: bossDef.name,
    bossIcon: bossDef.icon,
    maxHp: bossDef.hp,
    currentHp: bossDef.hp,
    atk: bossDef.atk,
    def: bossDef.def,
    reward: bossDef.reward,
    ticksPerCombatRound: 10, // fight resolves every 10 game ticks
    tickCount: 0,
    summonHp: {}, // summonId → remaining hp
    log: [],
  }
}

// Returns true if boss is dead
export function bossIsDead(fight) { return fight.currentHp <= 0 }
