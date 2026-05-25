import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import {
  STARTING, BUILDINGS, RECIPES, HERO_CLASSES, HERO_NAMES,
  PRESTIGE_THRESHOLD_GOLD, PRESTIGE_THRESHOLD_LEVEL, PRESTIGE_BONUSES,
  xpToNext,
} from '../utils/constants'
import { randInt, pick, canAfford } from '../utils/helpers'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const freshBuildings = () =>
  Object.fromEntries(Object.entries(BUILDINGS).map(([id, d]) => [id, { level: d.startLevel, id }]))

const getPrestigeBonus = (count) => {
  if (count === 0) return { goldMult: 1, xpMult: 1, craftMult: 1, soulRate: 1 }
  if (count <= PRESTIGE_BONUSES.length) return PRESTIGE_BONUSES[count - 1]
  // Beyond max defined: compound +10% per extra run
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

// ─── Initial state factory ────────────────────────────────────────────────────
const INITIAL = () => ({
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
    totalGoldEarned: 0,   // tracks across ALL runs (never resets)
    unlockedAt: [],       // timestamps of each prestige
  },

  stats: {
    heroesServed: 0,
    itemsCrafted: 0,
    itemsSold: 0,
    skeletonsSummoned: 0,
    totalGoldEarned: 0,   // resets each run
    runGoldEarned: 0,     // alias for prestige check
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
          s.player.stats = {
            strength:     (s.player.stats?.strength     ?? 5) + 1,
            intelligence: (s.player.stats?.intelligence ?? 5) + 1,
          }
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
        set((st) => { st.inventory.push(item); st.stats.itemsCrafted++ })
        get().addLog(`⚒️ ${recipe.icon} ${recipe.name} (${value} 💰) geschmiedet!`, 'craft')
        get().notify(`${recipe.name} fertig!`, 'success')
      },

      sellItem: (itemId) => {
        const s = get()
        const item = s.inventory.find((i) => i.id === itemId)
        if (!item) return
        get().addGold(item.value)
        set((st) => { st.inventory = st.inventory.filter((i) => i.id !== itemId); st.stats.itemsSold++ })
        get().addLog(`💰 ${item.name} für ${item.value} Gold verkauft.`, 'gold')
      },

      sellAll: () => {
        const s = get()
        if (!s.inventory.length) return
        const total = s.inventory.reduce((sum, i) => sum + i.value, 0)
        get().addGold(total)
        set((st) => { st.stats.itemsSold += st.inventory.length; st.inventory = [] })
        get().addLog(`💰 Alles verkauft für ${total} Gold!`, 'gold')
        get().notify(`${total} Gold erhalten!`, 'success')
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
        const prevLog = s.log.slice(0, 5)
        const bonus = getPrestigeBonus(newCount)

        set(() => ({
          ...INITIAL(),
          // Preserve prestige data
          prestige: {
            count: newCount,
            totalGoldEarned: totalGold,
            unlockedAt: [...s.prestige.unlockedAt, Date.now()],
          },
          tutorial: { active: false, step: 6 }, // skip tutorial after first prestige
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
      },

      // ── Hard reset ───────────────────────────────────────────────────────
      hardReset: () => {
        set(() => ({ ...INITIAL(), buildings: freshBuildings() }))
      },
    })),
    {
      name: 'grimlledger-v3',
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
