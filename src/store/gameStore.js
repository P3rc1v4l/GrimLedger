import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import {
  STARTING, BUILDINGS, RECIPES, HERO_CLASSES, HERO_NAMES,
  PRESTIGE_THRESHOLD_GOLD, PRESTIGE_THRESHOLD_LEVEL, PRESTIGE_BONUSES,
  xpToNext,
} from '../utils/constants'
import { randInt, pick, canAfford } from '../utils/helpers'
import { generateDailyQuests, getTodayStart, QUEST_REFRESH_MS } from '../systems/quests'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const freshBuildings = () =>
  Object.fromEntries(Object.entries(BUILDINGS).map(([id, d]) => [id, { level: d.startLevel, id }]))

const getPrestigeBonus = (count) => {
  if (count === 0) return { goldMult: 1, xpMult: 1, craftMult: 1, soulRate: 1 }
  if (count <= PRESTIGE_BONUSES.length) return PRESTIGE_BONUSES[count - 1]
  const base = PRESTIGE_BONUSES[PRESTIGE_BONUSES.length - 1]
  const extra = count - PRESTIGE_BONUSES.length
  return {
    goldMult:  base.goldMult  + extra * 0.10,
    xpMult:    base.xpMult   + extra * 0.10,
    craftMult: base.craftMult + extra * 0.05,
    soulRate:  base.soulRate  + extra * 0.10,
    label: `+${Math.round((base.goldMult + extra * 0.10 - 1) * 100)}% Gold / XP`,
  }
}

// ─── Quest helpers ────────────────────────────────────────────────────────────
// Update quest progress when a tracked stat changes.
// statKey: one of heroesServed | itemsCrafted | itemsSold | skeletonsSummoned | runsCompleted
// delta: how much it increased (usually 1)
const advanceQuests = (state, statKey, delta = 1) => {
  for (const q of state.quests.active) {
    if (q.completed) continue

    if (q.type === statKey) {
      // Simple quest
      q.progress = Math.min(q.goal, (q.progress ?? 0) + delta)
      if (q.progress >= q.goal) q.completed = true
    } else if (q.conditions) {
      // Mixed quest: advance matching condition
      for (let i = 0; i < q.conditions.length; i++) {
        if (q.conditions[i].type === statKey) {
          q.conditionProgress[i] = Math.min(q.conditions[i].goal, (q.conditionProgress[i] ?? 0) + delta)
        }
      }
      // Mark complete when ALL conditions met
      if (q.conditions.every((c, i) => q.conditionProgress[i] >= c.goal)) {
        q.completed = true
      }
    }
  }
}

// ─── Initial state factory ────────────────────────────────────────────────────
const INITIAL = (prestigeCount = 0) => ({
  gold: STARTING.gold,
  souls: 0,
  materials: { ...STARTING.materials },

  player: {
    level: 1,
    xp: 0,
    xpToNext: xpToNext(1),
  },

  buildings: freshBuildings(),
  heroes: [],
  undead: [],
  dungeonRuns: [],
  inventory: [],

  // Prestige — persists across resets
  prestige: {
    count: 0,
    totalGoldEarned: 0,
    unlockedAt: [],
  },

  // Quests — refresh daily
  quests: {
    active: generateDailyQuests(prestigeCount),
    lastRefresh: getTodayStart(),
    totalCompleted: 0,
    totalClaimed: 0,
  },

  stats: {
    heroesServed: 0,
    itemsCrafted: 0,
    itemsSold: 0,
    skeletonsSummoned: 0,
    totalGoldEarned: 0,
    runGoldEarned: 0,
    totalPlayTime: 0,
    runsCompleted: 0,
  },

  activeTab: 'tavern',
  log: [
    { id: 0, msg: '📜 GrimLedger öffnet seine Tore...', type: 'system', ts: Date.now() },
    { id: 1, msg: '💡 Lade einen Helden in die Taverne ein, um Gold zu verdienen.', type: 'tip', ts: Date.now() },
  ],
  logId: 2,
  notification: null,

  tutorial: { active: true, step: 0 },
})

// ─── Store ────────────────────────────────────────────────────────────────────
export const useGameStore = create(
  persist(
    immer((set, get) => ({
      ...INITIAL(),

      // ── Logging ──────────────────────────────────────────────────────────
      addLog: (msg, type = 'normal') => set((s) => {
        s.log.unshift({ id: s.logId++, msg, type, ts: Date.now() })
        if (s.log.length > 200) s.log.pop()
      }),

      notify: (msg, type = 'success') => {
        set((s) => { s.notification = { msg, type, id: Date.now() } })
        setTimeout(() => set((s) => { s.notification = null }), 3000)
      },

      // ── Resources ────────────────────────────────────────────────────────
      spendCost: (costs) => set((s) => {
        for (const [k, v] of Object.entries(costs)) {
          if (k === 'gold') s.gold = Math.max(0, s.gold - v)
          else s.materials[k] = Math.max(0, (s.materials[k] ?? 0) - v)
        }
      }),

      addGold: (raw) => set((s) => {
        const mult = getPrestigeBonus(s.prestige.count).goldMult
        const amount = Math.floor(raw * mult)
        s.gold += amount
        s.stats.totalGoldEarned += amount
        s.stats.runGoldEarned   += amount
        s.prestige.totalGoldEarned += amount
      }),

      addXP: (raw) => set((s) => {
        const mult = getPrestigeBonus(s.prestige.count).xpMult
        s.player.xp += Math.floor(raw * mult)
        while (s.player.xp >= s.player.xpToNext) {
          s.player.xp -= s.player.xpToNext
          s.player.level++
          s.player.xpToNext = xpToNext(s.player.level)
        }
      }),

      // ── Navigation ───────────────────────────────────────────────────────
      setTab: (tab) => set((s) => { s.activeTab = tab }),

      // ── Tutorial ─────────────────────────────────────────────────────────
      advanceTutorial: () => set((s) => {
        const next = s.tutorial.step + 1
        if (next >= 6) s.tutorial.active = false
        else s.tutorial.step = next
      }),
      dismissTutorial: () => set((s) => { s.tutorial.active = false }),

      // ── Buildings ────────────────────────────────────────────────────────
      buildOrUpgrade: (id) => {
        const s = get()
        const b = s.buildings[id]
        const def = BUILDINGS[id]
        if (!b || !def) return false

        const isNew = b.level === 0
        const costs = isNew ? def.unlockCost : def.upgradeCost(b.level + 1)
        if (b.level >= def.maxLevel) { get().notify('Max. Level erreicht', 'error'); return false }
        if (!canAfford(s, costs)) { get().notify('Zu wenig Ressourcen!', 'error'); return false }

        get().spendCost(costs)
        set((st) => { st.buildings[id].level++ })
        const newLvl = get().buildings[id].level
        const msg = isNew ? `🏗️ ${def.name} gebaut!` : `⬆️ ${def.name} → Stufe ${newLvl}`
        get().addLog(msg, 'upgrade')
        get().notify(msg, 'success')
        return true
      },

      // ── Tavern ───────────────────────────────────────────────────────────
      inviteHero: () => {
        const s = get()
        if (s.buildings.tavern.level < 1) return
        if (s.gold < 10) { get().notify('Zu wenig Gold (10 💰)', 'error'); return }

        const tpl = pick(HERO_CLASSES)
        const lvl = s.buildings.tavern.level
        const spent = randInt(tpl.minG + lvl * 3, tpl.maxG + lvl * 5)
        const hero  = { id: Date.now(), name: pick(HERO_NAMES), ...tpl, level: randInt(1, Math.max(1, lvl)), goldSpent: spent }

        get().spendCost({ gold: 10 })
        get().addGold(spent)
        get().addXP(5 * lvl)
        set((st) => {
          st.heroes.unshift(hero)
          if (st.heroes.length > 10) st.heroes.pop()
          st.stats.heroesServed++
          advanceQuests(st, 'heroesServed', 1)
        })
        get().addLog(`${hero.icon} ${hero.name} (${hero.class} Lvl ${hero.level}) gibt ${spent} Gold aus!`, 'gold')
      },

      // ── Dungeon ──────────────────────────────────────────────────────────
      startRun: () => {
        const s = get()
        const def = BUILDINGS.dungeon
        const lvl = s.buildings.dungeon.level
        if (lvl < 1) return

        const max = def.maxRuns(lvl)
        if (s.dungeonRuns.length >= max) { get().notify(`Max. ${max} Expeditionen gleichzeitig`, 'error'); return }

        const dur  = def.runDuration(lvl)
        const rng  = def.rewardGold(lvl)
        const run  = {
          id: Date.now(), startTime: Date.now(), duration: dur, level: lvl,
          reward: {
            gold:  randInt(rng.min, rng.max),
            xp:    def.rewardXP(lvl),
            bones: Math.random() < 0.4 + lvl * 0.05 ? randInt(1, 3 * lvl) : 0,
            herbs:  Math.random() < 0.20 ? randInt(1, lvl) : 0,
          },
        }
        set((st) => { st.dungeonRuns.push(run) })
        get().addLog(`⛓️ Verlies Stufe ${lvl} — Expedition gestartet (${Math.ceil(dur / 1000)}s)`, 'dungeon')
      },

      completeRun: (runId) => {
        const s  = get()
        const run = s.dungeonRuns.find((r) => r.id === runId)
        if (!run) return

        get().addGold(run.reward.gold)
        get().addXP(run.reward.xp)
        if (run.reward.bones > 0) set((st) => { st.materials.bones += run.reward.bones })
        if (run.reward.herbs  > 0) set((st) => { st.materials.herbs  += run.reward.herbs  })
        set((st) => {
          st.dungeonRuns = st.dungeonRuns.filter((r) => r.id !== runId)
          st.stats.runsCompleted++
          advanceQuests(st, 'runsCompleted', 1)
        })
        const extras = [
          run.reward.bones > 0 && `${run.reward.bones} 🦴`,
          run.reward.herbs  > 0 && `${run.reward.herbs} 🌿`,
        ].filter(Boolean).join(' ')
        get().addLog(`✅ Expedition zurück! +${run.reward.gold} 💰 +${run.reward.xp} XP${extras ? ' · ' + extras : ''}`, 'gold')
      },

      // ── Necromancer ──────────────────────────────────────────────────────
      raiseSkeleton: () => {
        const s = get()
        const def = BUILDINGS.crypt
        const lvl = s.buildings.crypt.level
        if (lvl < 1) return

        const max = def.maxUndead(lvl)
        if (s.undead.length >= max) { get().notify(`Max. ${max} Untote für Stufe ${lvl}`, 'error'); return }
        if (s.souls < 5 || (s.materials.bones ?? 0) < 3) { get().notify('5 Seelen + 3 Knochen benötigt', 'error'); return }

        const sk = { id: Date.now(), name: `Skelett-${randInt(100, 999)}`, level: Math.max(1, Math.floor(lvl / 2)) }
        set((st) => {
          st.souls -= 5
          st.materials.bones -= 3
          st.undead.push(sk)
          st.stats.skeletonsSummoned++
          advanceQuests(st, 'skeletonsSummoned', 1)
        })
        get().addLog(`💀 ${sk.name} beschworen! (${get().undead.length}/${max})`, 'undead')
        get().notify(`${sk.name} erwacht!`, 'success')
      },

      dismissUndead: (id) => {
        set((s) => { s.undead = s.undead.filter((u) => u.id !== id) })
        get().addLog('☠️ Einen Untoten entlassen.', 'normal')
      },

      // ── Forge ────────────────────────────────────────────────────────────
      craftItem: (recipeId) => {
        const s = get()
        const recipe = RECIPES[recipeId]
        const forgeLvl = s.buildings.forge.level
        if (!recipe || forgeLvl < recipe.reqLevel) return
        if (!canAfford(s, recipe.cost)) { get().notify('Zu wenig Ressourcen!', 'error'); return }

        get().spendCost(recipe.cost)
        const craftMult = getPrestigeBonus(s.prestige.count).craftMult
        const bonus = BUILDINGS.forge.craftBonus(forgeLvl)
        const value = Math.floor(recipe.baseValue * (1 + bonus) * craftMult)

        const item = { id: Date.now(), recipeId, name: recipe.name, icon: recipe.icon, type: recipe.type, value, bonus: recipe.bonus }
        set((st) => {
          st.inventory.push(item)
          st.stats.itemsCrafted++
          advanceQuests(st, 'itemsCrafted', 1)
        })
        get().addLog(`⚒️ ${recipe.icon} ${recipe.name} (${value} 💰) geschmiedet!`, 'craft')
        get().notify(`${recipe.name} fertig!`, 'success')
      },

      sellItem: (itemId) => {
        const s = get()
        const item = s.inventory.find((i) => i.id === itemId)
        if (!item) return
        get().addGold(item.value)
        set((st) => {
          st.inventory = st.inventory.filter((i) => i.id !== itemId)
          st.stats.itemsSold++
          advanceQuests(st, 'itemsSold', 1)
        })
        get().addLog(`💰 ${item.name} für ${item.value} Gold verkauft.`, 'gold')
      },

      sellAll: () => {
        const s = get()
        if (!s.inventory.length) return
        const count = s.inventory.length
        const total = s.inventory.reduce((sum, i) => sum + i.value, 0)
        get().addGold(total)
        set((st) => {
          st.stats.itemsSold += count
          advanceQuests(st, 'itemsSold', count)
          st.inventory = []
        })
        get().addLog(`💰 Alles verkauft für ${total} Gold!`, 'gold')
        get().notify(`${total} Gold erhalten!`, 'success')
      },

      // ── QUESTS ───────────────────────────────────────────────────────────
      claimQuest: (questId) => {
        const s = get()
        const quest = s.quests.active.find((q) => q.id === questId)
        if (!quest || !quest.completed || quest.claimed) return

        // Grant rewards
        const r = quest.reward
        if (r.gold)   get().addGold(r.gold)
        if (r.xp)     get().addXP(r.xp)
        if (r.souls)  set((st) => { st.souls += r.souls })
        if (r.materials) {
          for (const [mat, amt] of Object.entries(r.materials)) {
            set((st) => { st.materials[mat] = (st.materials[mat] ?? 0) + amt })
          }
        }

        set((st) => {
          const q = st.quests.active.find((q) => q.id === questId)
          if (q) q.claimed = true
          st.quests.totalClaimed++
          st.quests.totalCompleted++
        })

        const rewardStr = [
          r.gold && `${r.gold} 💰`,
          r.xp   && `${r.xp} XP`,
          r.souls && `${r.souls} Seelen`,
        ].filter(Boolean).join(' · ')
        get().addLog(`🎯 Quest abgeschlossen: "${quest.title}" — ${rewardStr}`, 'quest')
        get().notify(`Quest: ${quest.title}! ${rewardStr}`, 'success')
      },

      // Called by the tick — refresh quests at midnight
      checkQuestRefresh: () => {
        const s = get()
        const todayStart = getTodayStart()
        if (s.quests.lastRefresh < todayStart) {
          const fresh = generateDailyQuests(s.prestige.count)
          set((st) => {
            st.quests.active = fresh
            st.quests.lastRefresh = todayStart
          })
          get().addLog('📋 Neue Tagesquests verfügbar!', 'quest')
          get().notify('Neue Quests verfügbar! 📋', 'info')
        }
      },

      // ── PRESTIGE ─────────────────────────────────────────────────────────
      canPrestige: () => {
        const s = get()
        return s.player.level >= PRESTIGE_THRESHOLD_LEVEL &&
               s.stats.runGoldEarned >= PRESTIGE_THRESHOLD_GOLD
      },

      getPrestigeBonus: () => getPrestigeBonus(get().prestige.count),

      performPrestige: () => {
        const s = get()
        if (!get().canPrestige()) { get().notify('Voraussetzungen nicht erfüllt!', 'error'); return }

        const newCount = s.prestige.count + 1
        const totalGold = s.prestige.totalGoldEarned
        const totalCompleted = s.quests.totalCompleted
        const totalClaimed   = s.quests.totalClaimed
        const prevLog = s.log.slice(0, 5)
        const bonus = getPrestigeBonus(newCount)

        set(() => ({
          ...INITIAL(newCount),
          prestige: {
            count: newCount,
            totalGoldEarned: totalGold,
            unlockedAt: [...s.prestige.unlockedAt, Date.now()],
          },
          quests: {
            active: generateDailyQuests(newCount),
            lastRefresh: getTodayStart(),
            totalCompleted,
            totalClaimed,
          },
          tutorial: { active: false, step: 6 },
          log: [
            { id: 0, msg: `✨ Prestige #${newCount} durchgeführt! Bonus: ${bonus.label ?? getPrestigeLabel(newCount)}`, type: 'prestige', ts: Date.now() },
            ...prevLog,
          ],
          logId: 10,
          buildings: freshBuildings(),
        }))
        get().notify(`✨ Prestige #${newCount}! Dauerhafter Bonus aktiv.`, 'success')
      },

      // ── Tick ─────────────────────────────────────────────────────────────
      tick: (delta) => {
        const s = get()
        set((st) => { st.stats.totalPlayTime += delta })

        // Passive - tavern
        const tLvl = s.buildings.tavern.level
        if (tLvl > 0 && Math.random() < BUILDINGS.tavern.passiveChance(tLvl)) {
          get().addGold(BUILDINGS.tavern.passiveGold(tLvl))
        }
        // Passive - shop
        const sLvl = s.buildings.shop.level
        if (sLvl > 0 && Math.random() < BUILDINGS.shop.passiveChance(sLvl)) {
          get().addGold(BUILDINGS.shop.passiveGold(sLvl))
        }
        // Crypt soul gen
        const cLvl = s.buildings.crypt.level
        if (cLvl > 0 && s.undead.length > 0) {
          const rate = BUILDINGS.crypt.soulRate(cLvl) * s.undead.length * getPrestigeBonus(s.prestige.count).soulRate
          if (Math.random() < rate) {
            set((st) => { st.souls++ })
            if (Math.random() < 0.3) set((st) => { st.materials.bones++ })
          }
        }
        // Complete dungeon runs
        const now = Date.now()
        for (const run of s.dungeonRuns) {
          if (now - run.startTime >= run.duration) get().completeRun(run.id)
        }
        // Quest refresh check (throttled — only once per minute at most)
        if (Math.random() < 1 / 60) get().checkQuestRefresh()
      },

      // ── Hard reset ───────────────────────────────────────────────────────
      hardReset: () => {
        set(() => ({ ...INITIAL(), buildings: freshBuildings() }))
      },
    })),
    {
      name: 'grimlledger-v4',
      partialize: (s) => ({
        gold: s.gold,
        souls: s.souls,
        materials: s.materials,
        player: s.player,
        buildings: s.buildings,
        heroes: s.heroes,
        undead: s.undead,
        inventory: s.inventory,
        stats: s.stats,
        prestige: s.prestige,
        quests: s.quests,
        tutorial: s.tutorial,
        log: s.log.slice(0, 40),
        logId: s.logId,
      }),
    }
  )
)

function getPrestigeLabel(count) {
  const b = getPrestigeBonus(count)
  return `+${Math.round((b.goldMult - 1) * 100)}% Gold, +${Math.round((b.xpMult - 1) * 100)}% XP`
}
