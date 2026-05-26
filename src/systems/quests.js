import { QUEST_POOL, DAILY_QUEST_COUNT, MILESTONE_QUESTS } from '../utils/constants'
import { seededShuffle, todaySeed, getTodayStart } from '../utils/helpers'

export function generateDailyQuests(prestigeCount = 0) {
  const seed = todaySeed() + prestigeCount * 37
  const pool = seededShuffle(QUEST_POOL, seed)
  return pool.slice(0, DAILY_QUEST_COUNT).map((q) => ({
    ...q, progress: 0, completed: false, claimed: false, daily: true,
  }))
}

export function freshMilestones(claimedIds = []) {
  return MILESTONE_QUESTS.map((q) => ({
    ...q,
    progress: 0,
    completed: claimedIds.includes(q.id),
    claimed:   claimedIds.includes(q.id),
  }))
}

// Advance action-based quests (researched, summoned, bossKilled, upgraded)
// Only for daily quests — milestones of this type are synced separately
export function advanceQuests(quests, statKey, delta = 1) {
  for (const q of quests) {
    if (q.claimed) continue          // already claimed — skip
    if (q.completed) continue        // already done — skip
    if (q.type !== statKey) continue
    q.progress = Math.min(q.goal, (q.progress ?? 0) + delta)
    if (q.progress >= q.goal) q.completed = true
  }
}

// Sync resource-based quests from totalCollected (runs every tick)
// Works for both daily quests AND milestones.
// totalCollected has keys: seelen, knochen, blut, schatten, ...
// stats has keys: researched, summoned, bossKilled, upgraded, ascensions, ...
export function syncAllQuests(quests, totalCollected, stats) {
  for (const q of quests) {
    if (q.claimed) continue   // claimed quests are frozen

    // Determine current value based on type
    let current = 0
    if (totalCollected[q.type] !== undefined) {
      // Resource-based (seelen, knochen, blut, etc.)
      current = Math.floor(totalCollected[q.type] ?? 0)
    } else if (stats[q.type] !== undefined) {
      // Stat-based (researched, summoned, bossKilled, upgraded, ascensions)
      current = stats[q.type] ?? 0
    } else {
      continue  // unknown type — skip
    }

    q.progress = Math.min(q.goal, current)
    q.completed = q.progress >= q.goal
  }
}

// Legacy alias kept for compatibility
export function syncResourceQuests(quests, totalCollected) {
  syncAllQuests(quests, totalCollected, {})
}
