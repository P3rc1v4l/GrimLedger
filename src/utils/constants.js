// ─── BALANCE — tweak numbers here freely ─────────────────────────────────────

export const TICK_MS = 1000

export const STARTING = {
  gold: 150,
  souls: 0,
  materials: { iron: 25, wood: 35, cloth: 15, bones: 0, herbs: 8 },
}

export const BUILDINGS = {
  tavern: {
    name: 'Taverne', icon: '🍺',
    description: 'Helden kommen, trinken und zahlen. Passive Goldquelle.',
    startLevel: 1, maxLevel: 10, unlockCost: null,
    upgradeCost: (l) => ({ gold: 80 * l, wood: 8 * l }),
    passiveGold: (l) => l * 2,
    passiveChance: (l) => (0.18 + l * 0.04) / 10,
  },
  shop: {
    name: 'Krämladen', icon: '⚖️',
    description: 'Reisende kaufen Waren. Weitere passive Einnahmen.',
    startLevel: 1, maxLevel: 10, unlockCost: null,
    upgradeCost: (l) => ({ gold: 100 * l, wood: 6 * l }),
    passiveGold: (l) => l * 2.5,
    passiveChance: (l) => (0.15 + l * 0.035) / 10,
  },
  forge: {
    name: 'Schmiede', icon: '⚒️',
    description: 'Schmiedekunst. Waffen, Rüstungen, Amulette.',
    startLevel: 0, maxLevel: 10,
    unlockCost: { gold: 150, iron: 20 },
    upgradeCost: (l) => ({ gold: 150 * l, iron: 15 * l }),
    craftBonus: (l) => l * 0.1,
  },
  dungeon: {
    name: 'Verlies', icon: '⛓️',
    description: 'Automatische Expeditionen. Gold, XP und Ressourcen.',
    startLevel: 0, maxLevel: 10,
    unlockCost: { gold: 200, bones: 5 },
    upgradeCost: (l) => ({ gold: 200 * l, bones: 8 * l }),
    maxRuns: (l) => Math.min(1 + Math.floor(l / 2), 5),
    runDuration: (l) => Math.max(8000, 30000 - l * 2200),
    rewardGold: (l) => ({ min: 15 * l, max: 35 * l }),
    rewardXP: (l) => 10 * l,
  },
  crypt: {
    name: 'Gruft', icon: '💀',
    description: 'Nekromantie. Untote Diener sammeln Seelen und Knochen.',
    startLevel: 0, maxLevel: 10,
    unlockCost: { gold: 120, bones: 15 },
    upgradeCost: (l) => ({ gold: 120 * l, bones: 12 * l }),
    maxUndead: (l) => 2 + l * 2,
    soulRate: (l) => 0.003 * l,
  },
}

export const RECIPES = {
  iron_sword:  { name: 'Eisenschwert',     icon: '⚔️', type: 'weapon',     cost: { iron: 5, gold: 30 },  baseValue: 80,  bonus: { strength: 2 },      reqLevel: 1 },
  steel_axe:   { name: 'Stahlaxt',         icon: '🪓', type: 'weapon',     cost: { iron: 10, gold: 60 }, baseValue: 150, bonus: { strength: 4 },      reqLevel: 3 },
  chainmail:   { name: 'Kettenhemd',       icon: '🛡️', type: 'armor',      cost: { iron: 8, gold: 50 },  baseValue: 120, bonus: { defense: 3 },       reqLevel: 1 },
  plate_helm:  { name: 'Plattenpanzer',    icon: '🪖', type: 'armor',      cost: { iron: 15, gold: 90 }, baseValue: 200, bonus: { defense: 5 },       reqLevel: 4 },
  bone_amulet: { name: 'Knochen-Amulett', icon: '📿', type: 'accessory',  cost: { bones: 5, gold: 40 }, baseValue: 100, bonus: { intelligence: 2 }, reqLevel: 1 },
  herb_potion: { name: 'Heiltrank',        icon: '🧪', type: 'consumable', cost: { herbs: 4, gold: 20 }, baseValue: 55,  bonus: {},                   reqLevel: 2 },
}

export const HERO_CLASSES = [
  { class: 'Krieger',     icon: '⚔️', color: 'text-red-400',    minG: 15, maxG: 40 },
  { class: 'Magier',      icon: '🪄', color: 'text-blue-400',   minG: 20, maxG: 50 },
  { class: 'Schurke',     icon: '🗡️', color: 'text-yellow-400', minG: 10, maxG: 35 },
  { class: 'Kleriker',    icon: '✝️', color: 'text-green-400',  minG: 18, maxG: 45 },
  { class: 'Bogenschütze',icon: '🏹', color: 'text-orange-400', minG: 12, maxG: 38 },
  { class: 'Barbar',      icon: '🪖', color: 'text-rose-400',   minG: 25, maxG: 60 },
]

export const HERO_NAMES = [
  'Aldric','Seraphina','Krag','Lyra','Brom','Elara','Thorin','Mira',
  'Gareth','Isolde','Vane','Petra','Ulf','Cass','Draven','Sonia','Halvard','Zara',
]

// ─── PRESTIGE ─────────────────────────────────────────────────────────────────
// Each prestige run resets resources & buildings but gives permanent "Omen" bonuses.
export const PRESTIGE_THRESHOLD_GOLD = 50000   // total gold earned to unlock prestige
export const PRESTIGE_THRESHOLD_LEVEL = 15     // player level required

export const PRESTIGE_BONUSES = [
  // Index = prestige count (0-indexed)
  { label: '+15% Gold',           goldMult: 1.15, xpMult: 1.00, craftMult: 1.00, soulRate: 1.00 },
  { label: '+15% Gold, +20% XP',  goldMult: 1.15, xpMult: 1.20, craftMult: 1.00, soulRate: 1.00 },
  { label: '+30% Gold, +20% XP',  goldMult: 1.30, xpMult: 1.20, craftMult: 1.00, soulRate: 1.00 },
  { label: '+30% Gold, +40% XP, +20% Handwerk', goldMult: 1.30, xpMult: 1.40, craftMult: 1.20, soulRate: 1.00 },
  { label: '+50% alles',          goldMult: 1.50, xpMult: 1.50, craftMult: 1.50, soulRate: 1.50 },
]
// Beyond index 4: each additional prestige stacks +10% gold & xp on top of run 4 values.

export const xpToNext = (level) => Math.floor(100 * Math.pow(1.45, level - 1))
