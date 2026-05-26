// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────

export const ACHIEVEMENTS = [
  // ── Seelen-Milesteine ────────────────────────────────────────────────────
  { id: 'ach_seelen_100',    icon: '💀', title: 'Erste Ernte',      desc: '100 Seelen gesammelt.',          type: 'totalSeelen',  goal: 100,    bonus: { prodMult: 0.01 }, bonusLabel: '+1% Produktion' },
  { id: 'ach_seelen_1k',     icon: '💀', title: 'Seelensammler',    desc: '1.000 Seelen gesammelt.',        type: 'totalSeelen',  goal: 1000,   bonus: { prodMult: 0.02 }, bonusLabel: '+2% Produktion' },
  { id: 'ach_seelen_10k',    icon: '💀', title: 'Archivar',         desc: '10.000 Seelen gesammelt.',       type: 'totalSeelen',  goal: 10000,  bonus: { prodMult: 0.05 }, bonusLabel: '+5% Produktion' },
  { id: 'ach_seelen_100k',   icon: '💀', title: 'Seelenherr',       desc: '100.000 Seelen gesammelt.',      type: 'totalSeelen',  goal: 100000, bonus: { prodMult: 0.10 }, bonusLabel: '+10% Produktion' },

  // ── Gebäude ───────────────────────────────────────────────────────────────
  { id: 'ach_build_first',   icon: '🏛️', title: 'Erster Stein',     desc: 'Erstes Gebäude gebaut.',         type: 'upgraded',     goal: 1,    bonus: { goldMult: 0.05 }, bonusLabel: 'Nichts — Ehre genügt' },
  { id: 'ach_build_10',      icon: '🏛️', title: 'Baumeister',       desc: '10 Upgrades durchgeführt.',      type: 'upgraded',     goal: 10,   bonus: { prodMult: 0.03 }, bonusLabel: '+3% Produktion' },
  { id: 'ach_build_50',      icon: '🏛️', title: 'Architektur des Bösen', desc: '50 Upgrades.',              type: 'upgraded',     goal: 50,   bonus: { prodMult: 0.05 }, bonusLabel: '+5% Produktion' },

  // ── Forschung ─────────────────────────────────────────────────────────────
  { id: 'ach_research_1',    icon: '📜', title: 'Wissbegierig',     desc: 'Erste Forschung abgeschlossen.', type: 'researched',   goal: 1,    bonus: { prodMult: 0.02 }, bonusLabel: '+2% Produktion' },
  { id: 'ach_research_5',    icon: '📜', title: 'Gelehrter',        desc: '5 Technologien erforscht.',      type: 'researched',   goal: 5,    bonus: { prodMult: 0.05 }, bonusLabel: '+5% Produktion' },
  { id: 'ach_research_all',  icon: '📜', title: 'Meister des Dunklen Wissens', desc: 'Alle Technologien erforscht.', type: 'researched', goal: 11, bonus: { prodMult: 0.15 }, bonusLabel: '+15% Produktion' },

  // ── Beschwörung ───────────────────────────────────────────────────────────
  { id: 'ach_summon_1',      icon: '🔮', title: 'Beschwörer',       desc: 'Erstes Wesen beschworen.',       type: 'summoned',     goal: 1,    bonus: { prodMult: 0.02 }, bonusLabel: '+2% Produktion' },
  { id: 'ach_summon_10',     icon: '🔮', title: 'Herr der Toten',   desc: '10 Wesen beschworen.',           type: 'summoned',     goal: 10,   bonus: { prodMult: 0.05 }, bonusLabel: '+5% Produktion' },

  // ── Bosskämpfe ────────────────────────────────────────────────────────────
  { id: 'ach_boss_1',        icon: '⚔️', title: 'Erste Trophäe',    desc: 'Ersten Boss besiegt.',           type: 'bossKilled',   goal: 1,    bonus: { prodMult: 0.05 }, bonusLabel: '+5% Produktion' },
  { id: 'ach_boss_all',      icon: '⚔️', title: 'Bezwinger der Dunklen', desc: 'Alle Bosse besiegt.',      type: 'bossKilled',   goal: 4,    bonus: { prodMult: 0.15 }, bonusLabel: '+15% Produktion' },

  // ── Aufstieg ──────────────────────────────────────────────────────────────
  { id: 'ach_ascend_1',      icon: '⬡', title: 'Aufgestiegener',   desc: 'Ersten Aufstieg durchgeführt.',  type: 'ascensions',   goal: 1,    bonus: { prodMult: 0.10 }, bonusLabel: '+10% Produktion' },
  { id: 'ach_ascend_5',      icon: '⬡', title: 'Ewiger Archivar',  desc: '5 Aufstiege.',                  type: 'ascensions',   goal: 5,    bonus: { prodMult: 0.25 }, bonusLabel: '+25% Produktion' },

  // ── Spielzeit ─────────────────────────────────────────────────────────────
  { id: 'ach_time_1h',       icon: '⏱️', title: 'Eingeweiht',       desc: '1 Stunde gespielt.',             type: 'totalPlayTime', goal: 3_600_000,    bonus: { prodMult: 0.01 }, bonusLabel: '+1% Produktion' },
  { id: 'ach_time_10h',      icon: '⏱️', title: 'Besessen',         desc: '10 Stunden gespielt.',           type: 'totalPlayTime', goal: 36_000_000,   bonus: { prodMult: 0.03 }, bonusLabel: '+3% Produktion' },
]

// Calculate total achievement production bonus (as multiplier, e.g. 1.15)
export function calcAchievementBonus(unlockedIds) {
  let total = 0
  for (const ach of ACHIEVEMENTS) {
    if (unlockedIds.includes(ach.id) && ach.bonus?.prodMult) {
      total += ach.bonus.prodMult
    }
  }
  return 1 + total
}

// Check which new achievements should unlock given current stats
export function checkAchievements(stats, totalCollected, unlockedIds) {
  const newlyUnlocked = []
  for (const ach of ACHIEVEMENTS) {
    if (unlockedIds.includes(ach.id)) continue
    let current = 0
    if (ach.type === 'totalSeelen')    current = totalCollected.seelen ?? 0
    else if (ach.type === 'totalPlayTime') current = stats.totalPlayTime ?? 0
    else current = stats[ach.type] ?? 0
    if (current >= ach.goal) newlyUnlocked.push(ach.id)
  }
  return newlyUnlocked
}
