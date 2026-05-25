// ─── QUEST SYSTEM ─────────────────────────────────────────────────────────────
// Quests reset every 24 hours. 3 random quests per day.
// Each quest tracks progress against a stat/action counter.

export const QUEST_REFRESH_MS = 24 * 60 * 60 * 1000  // 24h

// Quest template pool
// type: which store action increments this quest
// goal: how many times it needs to happen
// reward: what the player gets
export const QUEST_POOL = [
  // ── Tavern ──────────────────────────────────────────────────────────────
  {
    id: 'q_heroes_3',
    title: 'Stammgäste',
    description: 'Lade 3 Helden in die Taverne ein.',
    icon: '🍺',
    category: 'tavern',
    type: 'heroesServed',
    goal: 3,
    reward: { gold: 80, xp: 30 },
  },
  {
    id: 'q_heroes_8',
    title: 'Volle Schankstube',
    description: 'Lade 8 Helden in die Taverne ein.',
    icon: '🍻',
    category: 'tavern',
    type: 'heroesServed',
    goal: 8,
    reward: { gold: 200, xp: 80 },
  },
  {
    id: 'q_heroes_15',
    title: 'Legendarische Nacht',
    description: 'Lade 15 Helden in die Taverne ein.',
    icon: '🎉',
    category: 'tavern',
    type: 'heroesServed',
    goal: 15,
    reward: { gold: 450, xp: 180, materials: { wood: 10 } },
  },

  // ── Forge ────────────────────────────────────────────────────────────────
  {
    id: 'q_craft_2',
    title: 'Fleißiger Schmied',
    description: 'Schmiedet 2 beliebige Items.',
    icon: '⚒️',
    category: 'forge',
    type: 'itemsCrafted',
    goal: 2,
    reward: { gold: 60, materials: { iron: 8 } },
  },
  {
    id: 'q_craft_5',
    title: 'Meisterschmied',
    description: 'Schmiedet 5 Items.',
    icon: '🔥',
    category: 'forge',
    type: 'itemsCrafted',
    goal: 5,
    reward: { gold: 180, xp: 60, materials: { iron: 20 } },
  },
  {
    id: 'q_sell_3',
    title: 'Händlerinstinkt',
    description: 'Verkauft 3 Items.',
    icon: '💰',
    category: 'forge',
    type: 'itemsSold',
    goal: 3,
    reward: { gold: 120, xp: 40 },
  },
  {
    id: 'q_sell_8',
    title: 'Waffenhändler',
    description: 'Verkauft 8 Items.',
    icon: '⚔️',
    category: 'forge',
    type: 'itemsSold',
    goal: 8,
    reward: { gold: 350, xp: 100, materials: { iron: 15 } },
  },

  // ── Dungeon ──────────────────────────────────────────────────────────────
  {
    id: 'q_runs_2',
    title: 'Erste Schritte',
    description: 'Schließt 2 Verlies-Expeditionen ab.',
    icon: '⛓️',
    category: 'dungeon',
    type: 'runsCompleted',
    goal: 2,
    reward: { gold: 100, xp: 50, materials: { bones: 5 } },
  },
  {
    id: 'q_runs_5',
    title: 'Verlies-Veteran',
    description: 'Schließt 5 Expeditionen ab.',
    icon: '🗡️',
    category: 'dungeon',
    type: 'runsCompleted',
    goal: 5,
    reward: { gold: 280, xp: 120, materials: { bones: 12 } },
  },
  {
    id: 'q_runs_10',
    title: 'Unerschrockener Krieger',
    description: 'Schließt 10 Expeditionen ab.',
    icon: '🏆',
    category: 'dungeon',
    type: 'runsCompleted',
    goal: 10,
    reward: { gold: 600, xp: 250, souls: 10 },
  },

  // ── Crypt ─────────────────────────────────────────────────────────────────
  {
    id: 'q_undead_2',
    title: 'Erste Beschwörung',
    description: 'Beschwört 2 Skelett-Diener.',
    icon: '💀',
    category: 'crypt',
    type: 'skeletonsSummoned',
    goal: 2,
    reward: { gold: 70, souls: 8 },
  },
  {
    id: 'q_undead_5',
    title: 'Nekromanten-Lehrling',
    description: 'Beschwört 5 Skelette.',
    icon: '☠️',
    category: 'crypt',
    type: 'skeletonsSummoned',
    goal: 5,
    reward: { gold: 200, souls: 20, materials: { bones: 10 } },
  },

  // ── Mixed ─────────────────────────────────────────────────────────────────
  {
    id: 'q_mixed_economy',
    title: 'Das Bollwerk wächst',
    description: 'Lade 5 Helden ein und schmiedet 3 Items.',
    icon: '🏰',
    category: 'mixed',
    type: 'mixed_economy',  // special: multi-condition
    goal: 1,
    conditions: [
      { type: 'heroesServed', goal: 5, label: 'Helden eingeladen' },
      { type: 'itemsCrafted', goal: 3, label: 'Items geschmiedet' },
    ],
    reward: { gold: 400, xp: 150, materials: { iron: 10, wood: 10 } },
  },
  {
    id: 'q_mixed_dark',
    title: 'Dunkle Künste',
    description: 'Schließt 3 Expeditionen ab und beschwört 2 Skelette.',
    icon: '🌑',
    category: 'mixed',
    type: 'mixed_dark',
    goal: 1,
    conditions: [
      { type: 'runsCompleted', goal: 3, label: 'Expeditionen' },
      { type: 'skeletonsSummoned', goal: 2, label: 'Skelette beschworen' },
    ],
    reward: { gold: 350, xp: 130, souls: 15 },
  },
]

// How many quests per day
export const DAILY_QUEST_COUNT = 3

// Pick N random quests for today, seeded by the date so everyone gets the same
export function generateDailyQuests(prestigeCount = 0) {
  // Use today's date as a simple seed
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate() + prestigeCount * 37

  // Simple seeded shuffle
  const pool = [...QUEST_POOL]
  let s = seed
  for (let i = pool.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(s) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool.slice(0, DAILY_QUEST_COUNT).map((q) => ({
    ...q,
    progress: 0,
    // For mixed quests, track each condition separately
    conditionProgress: q.conditions ? q.conditions.map(() => 0) : undefined,
    completed: false,
    claimed: false,
  }))
}

// Get the start of today (midnight) as timestamp
export function getTodayStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
