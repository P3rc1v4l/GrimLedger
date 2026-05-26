import { QUEST_POOL, MILESTONES, DAILY_QUEST_COUNT } from '../utils/constants'
import { seededShuffle, todaySeed, getTodayMs } from '../utils/helpers'

export function makeDailyQuests(prestigeCount = 0) {
  const seed = todaySeed() + prestigeCount * 37
  return seededShuffle(QUEST_POOL, seed)
    .slice(0, DAILY_QUEST_COUNT)
    .map(q => ({ ...q, progress: 0, completed: false, claimed: false }))
}

export function makeMilestones(claimedIds = []) {
  return MILESTONES.map(q => ({
    ...q,
    progress: claimedIds.includes(q.id) ? q.goal : 0,
    completed: claimedIds.includes(q.id),
    claimed:   claimedIds.includes(q.id),
  }))
}

// Single unified sync — works for both daily quests and milestones.
// Reads current values from totalCollected (resource types) or stats (action types).
// totalCollected keys: seelen, knochen, blut, schatten, erinnerungen, asche, wissen, albtraeume, leereFragmente, gottloseEssenz
// stats keys: researched, summoned, bossKilled, upgraded, ascensions, playTime
export function syncQuests(quests, totalCollected, stats) {
  for (const q of quests) {
    if (q.claimed) continue  // frozen

    let current = 0
    if (q.type in totalCollected) {
      current = Math.floor(totalCollected[q.type] ?? 0)
    } else if (q.type === 'playTime') {
      current = stats.playTime ?? 0
    } else if (q.type in stats) {
      current = stats[q.type] ?? 0
    } else {
      continue  // unknown type
    }

    q.progress  = Math.min(q.goal, current)
    q.completed = q.progress >= q.goal
  }
}
