import { QUEST_POOL, DAILY_QUEST_COUNT, MILESTONE_QUESTS } from '../utils/constants'
import { seededShuffle, todaySeed, getTodayStart } from '../utils/helpers'

export function generateDailyQuests(prestigeCount = 0) {
  const seed   = todaySeed() + prestigeCount * 37
  const pool   = seededShuffle(QUEST_POOL, seed)
  return pool.slice(0, DAILY_QUEST_COUNT).map((q) => ({
    ...q, progress: 0, completed: false, claimed: false, daily: true,
  }))
}

export function freshMilestones(claimedIds = []) {
  return MILESTONE_QUESTS.map((q) => ({
    ...q, progress: 0, completed: claimedIds.includes(q.id), claimed: claimedIds.includes(q.id),
  }))
}

// Advance quest progress when a trackable stat changes
// statKey matches quest.type
export function advanceQuests(quests, statKey, delta = 1) {
  for (const q of quests) {
    if (q.completed || q.claimed) continue
    if (q.type === statKey) {
      q.progress = Math.min(q.goal, (q.progress ?? 0) + delta)
      if (q.progress >= q.goal) q.completed = true
    }
  }
}

// Advance resource-type quests based on total collected (cumulative)
export function syncResourceQuests(quests, totalCollected) {
  for (const q of quests) {
    if (q.completed || q.claimed) continue
    const val = totalCollected[q.type]
    if (val !== undefined) {
      q.progress = Math.min(q.goal, Math.floor(val))
      if (q.progress >= q.goal) q.completed = true
    }
  }
}
