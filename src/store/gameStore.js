import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import {
  BUILDINGS, RESEARCH, SUMMONS, BOSSES,
  PRESTIGE_THRESHOLD, ASCENSION_BONUSES,
  xpToNext, SAVE_KEY, TICK_MS,
} from '../utils/constants'
import { canAfford, randInt, pick, getTodayStart } from '../utils/helpers'
import { calcProductionRates, calcOfflineProduction, getPrestigeProdMult } from '../systems/production'
import { generateDailyQuests, freshMilestones, advanceQuests, syncAllQuests } from '../systems/quests'
import { combatTick, startBossFight, bossIsDead } from '../systems/combat'
import { ACHIEVEMENTS, checkAchievements, calcAchievementBonus } from '../systems/achievements'
import { EVENTS, EVENT_INTERVAL_BASE_MS, EVENT_INTERVAL_SPREAD } from '../systems/events'

// ── Helpers ───────────────────────────────────────────────────────────────────
const freshBuildings = () =>
  Object.fromEntries(Object.entries(BUILDINGS).map(([id, d]) => [id, { level: d.startLevel, id }]))

const freshResources = () => ({
  seelen: 10, knochen: 0, blut: 0, schatten: 0,
  erinnerungen: 0, asche: 0, wissen: 0, albtraeume: 0,
  leereFragmente: 0, gottloseEssenz: 0, abyssMarken: 0,
})

const MAX_OFFLINE_BASE_H = 8  // hours

// ── Initial state ─────────────────────────────────────────────────────────────
const INITIAL = (prestigeCount = 0, claimedMilestoneIds = []) => ({
  resources:    freshResources(),
  buildings:    freshBuildings(),
  researchDone: [],       // array of research IDs completed
  summons:      [],       // active summoned beings
  bossFight:    null,     // active boss fight state or null

  // Lifetime resource totals (for quests + milestones)
  totalCollected: Object.fromEntries(
    ['seelen','knochen','blut','schatten','erinnerungen','asche','wissen','albtraeume',
     'leereFragmente','gottloseEssenz'].map((k) => [k, 0])
  ),

  // Stats
  stats: {
    researched:  0,
    summoned:    0,
    bossKilled:  0,
    upgraded:    0,
    totalPlayTime: 0,
    ascensions:  0,
  },

  // Player level (driven by seelen collected)
  player: { level: 1, xp: 0, xpToNext: xpToNext(1) },

  // Prestige
  prestige: {
    count:         prestigeCount,
    abyssMarksTotal: 0,
    ascendedAt:    [],
  },

  // Quests
  quests: {
    daily:      generateDailyQuests(prestigeCount),
    milestones: freshMilestones(claimedMilestoneIds),
    lastRefresh: getTodayStart(),
    claimedMilestoneIds,
  },

  // Offline
  lastSaveTime: Date.now(),

  // UI
  activePanel: 'dashboard',
  tutorial: { active: true, step: 0 },

  // User settings (persist across resets)
  settings: {
    numberNotation: 'short',   // 'short' (K/M/B) | 'scientific' (1.5e6)
    theme: 'dark',             // 'dark' | 'darker' | 'blood'
    logSize: 100,              // max log entries shown
    autoSaveInterval: 30,      // seconds
    showProductionRates: true,
    showTutorial: true,
    offlineCapHours: 8,        // base hours (research can add more)
    compactNumbers: false,     // show decimals or not
  },
  log: [
    { id: 0, msg: '📜 Das Grim Ledger öffnet sich...', type: 'system', ts: Date.now() },
    { id: 1, msg: '💡 Die Seelenquelle beginnt zu fließen. Sammle Seelen.', type: 'tip', ts: Date.now() },
  ],
  logId: 2,
  notification: null,
  offlineResult: null,   // shown once after reload

  // Achievements (persist across resets — earned forever)
  achievements: {
    unlocked: [],     // array of achievement IDs
  },

  // Active event (shown as modal to player)
  activeEvent: null,   // { ...eventDef, expiresAt: timestamp }
  nextEventAt: Date.now() + EVENT_INTERVAL_BASE_MS,

  // Active buffs from events
  activeBuffs: [],   // [{ type, value, endsAt }]

  // Update state (filled by Electron IPC listener)
  updateInfo: null,      // { version, status: 'available'|'downloading'|'downloaded'|'error' }
})

// ── Store ─────────────────────────────────────────────────────────────────────
export const useGameStore = create(
  persist(
    immer((set, get) => ({
      ...INITIAL(),

      // ── Log / Notify ──────────────────────────────────────────────────────
      addLog: (msg, type = 'normal') => set((s) => {
        s.log.unshift({ id: s.logId++, msg, type, ts: Date.now() })
        if (s.log.length > 300) s.log.pop()
      }),

      notify: (msg, type = 'success') => {
        set((s) => { s.notification = { msg, type, id: Date.now() } })
        setTimeout(() => set((s) => { s.notification = null }), 3500)
      },

      // ── Resources ────────────────────────────────────────────────────────
      addResources: (gains) => set((s) => {
        for (const [k, v] of Object.entries(gains)) {
          if (v <= 0) continue
          s.resources[k]  = (s.resources[k]  ?? 0) + v
          s.totalCollected[k] = (s.totalCollected[k] ?? 0) + v
        }
        // XP from seelen
        if (gains.seelen) {
          s.player.xp += gains.seelen * 0.1
          while (s.player.xp >= s.player.xpToNext) {
            s.player.xp -= s.player.xpToNext
            s.player.level++
            s.player.xpToNext = xpToNext(s.player.level)
          }
        }
      }),

      spendResources: (costs) => set((s) => {
        for (const [k, v] of Object.entries(costs)) {
          s.resources[k] = Math.max(0, (s.resources[k] ?? 0) - v)
        }
      }),

      // ── Navigation ───────────────────────────────────────────────────────
      setPanel: (panel) => set((s) => { s.activePanel = panel }),

      advanceTutorial: () => set((s) => { if (s.tutorial) s.tutorial.step = (s.tutorial.step ?? 0) + 1 }),
      dismissTutorial: () => set((s) => { if (s.tutorial) s.tutorial.active = false }),

      // ── Settings ──────────────────────────────────────────────────────────
      updateSettings: (patch) => set((s) => { s.settings = { ...s.settings, ...patch } }),
      resetTutorial:  ()      => set((s) => { s.tutorial = { active: true, step: 0 }; s.activePanel = 'dashboard' }),

      // ── Achievements ──────────────────────────────────────────────────────
      checkAchievements: () => {
        const s = get()
        const newIds = checkAchievements(s.stats, s.totalCollected, s.achievements.unlocked)
        if (newIds.length === 0) return
        set((st) => { st.achievements.unlocked.push(...newIds) })
        for (const id of newIds) {
          const ach = ACHIEVEMENTS.find((a) => a.id === id)
          if (ach) {
            get().addLog(`🏆 Achievement: "${ach.title}" — ${ach.bonusLabel}`, 'achievement')
            get().notify(`🏆 ${ach.title}`, 'success')
          }
        }
      },

      // ── Events ────────────────────────────────────────────────────────────
      acceptEvent: () => {
        const s = get()
        const ev = s.activeEvent
        if (!ev) return
        const { effect } = ev

        // Instant resource gains/losses
        if (effect.instant) get().addResources(effect.instant)
        if (effect.lossFraction) {
          set((st) => {
            for (const [k, frac] of Object.entries(effect.lossFraction)) {
              const loss = Math.floor((st.resources[k] ?? 0) * frac)
              st.resources[k] = Math.max(0, (st.resources[k] ?? 0) - loss)
            }
          })
        }
        // Timed buff
        if (effect.buffType) {
          const endsAt = Date.now() + effect.buffDuration * 1000
          set((st) => { st.activeBuffs.push({ type: effect.buffType, value: effect.buffValue, endsAt }) })
        }
        // Pakt cost (fraction of resource)
        if (effect.cost?.knochenFraction) {
          set((st) => {
            const loss = Math.floor((st.resources.knochen ?? 0) * effect.cost.knochenFraction)
            st.resources.knochen = Math.max(0, (st.resources.knochen ?? 0) - loss)
          })
        }

        get().addLog(`${ev.icon} Ereignis angenommen: "${ev.title}"`, 'event')
        set((st) => { st.activeEvent = null; st.nextEventAt = Date.now() + get().nextEventDelay() })
      },

      rejectEvent: () => {
        const s = get()
        const ev = s.activeEvent
        if (!ev) return

        // Pay reject cost if specified
        if (ev.rejectCost && canAfford(s.resources, ev.rejectCost)) {
          get().spendResources(ev.rejectCost)
          get().addLog(`${ev.icon} Ereignis abgewehrt: "${ev.title}"`, 'event')
        } else if (ev.rejectCost) {
          // Can't afford → forced to accept penalty
          get().acceptEvent()
          return
        } else {
          get().addLog(`${ev.icon} Ereignis abgelehnt: "${ev.title}"`, 'event')
        }

        set((st) => { st.activeEvent = null; st.nextEventAt = Date.now() + get().nextEventDelay() })
      },

      nextEventDelay: () => {
        const spread = EVENT_INTERVAL_BASE_MS * EVENT_INTERVAL_SPREAD
        return EVENT_INTERVAL_BASE_MS + (Math.random() * 2 - 1) * spread
      },

      // ── Save/Export/Import ────────────────────────────────────────────────
      exportSave: () => {
        const s = get()
        const data = {
          version: '2.2.0',
          exportedAt: new Date().toISOString(),
          resources: s.resources,
          buildings: s.buildings,
          researchDone: s.researchDone,
          summons: s.summons,
          totalCollected: s.totalCollected,
          stats: s.stats,
          player: s.player,
          prestige: s.prestige,
          quests: s.quests,
          achievements: s.achievements,
          settings: s.settings,
        }
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href = url
        a.download = `GrimLedger-Save-${new Date().toISOString().slice(0,10)}.json`
        a.click()
        URL.revokeObjectURL(url)
        get().notify('Spielstand exportiert!', 'success')
      },

      importSave: (jsonString) => {
        try {
          const data = JSON.parse(jsonString)
          if (!data.resources || !data.buildings) throw new Error('Ungültiger Spielstand')
          set((s) => {
            if (data.resources)     s.resources     = data.resources
            if (data.buildings)     s.buildings     = data.buildings
            if (data.researchDone)  s.researchDone  = data.researchDone
            if (data.summons)       s.summons       = data.summons
            if (data.totalCollected)s.totalCollected= data.totalCollected
            if (data.stats)         s.stats         = data.stats
            if (data.player)        s.player        = data.player
            if (data.prestige)      s.prestige      = data.prestige
            if (data.quests)        s.quests        = data.quests
            if (data.achievements)  s.achievements  = data.achievements
            if (data.settings)      s.settings      = data.settings
          })
          get().notify('Spielstand importiert!', 'success')
          get().addLog('📂 Spielstand importiert.', 'system')
        } catch (e) {
          get().notify(`Import fehlgeschlagen: ${e.message}`, 'error')
        }
      },

      // ── Buildings ────────────────────────────────────────────────────────
      buildOrUpgrade: (id) => {
        const s   = get()
        const b   = s.buildings[id]
        const def = BUILDINGS[id]
        if (!def) return
        const isNew = b.level === 0
        const costs = isNew ? def.unlockCost : def.upgradeCost(b.level + 1)
        if (b.level >= def.maxLevel) { get().notify('Max. Level erreicht', 'error'); return }
        if (!canAfford(s.resources, costs)) { get().notify('Zu wenig Ressourcen!', 'error'); return }

        get().spendResources(costs)
        set((st) => { st.buildings[id].level++ ; st.stats.upgraded++ })
        const newLvl = get().buildings[id].level
        const msg = isNew ? `🏗️ ${def.name} errichtet!` : `⬆️ ${def.name} → Stufe ${newLvl}`
        get().addLog(msg, 'upgrade')
        get().notify(msg, 'success')
        get().checkQuestProgress('upgraded', 1)
      },

      // ── Research ─────────────────────────────────────────────────────────
      research: (id) => {
        const s   = get()
        const def = RESEARCH[id]
        if (!def) return
        if (s.researchDone.includes(id)) { get().notify('Bereits erforscht', 'error'); return }
        // Check prerequisites
        for (const req of (def.requires ?? [])) {
          if (!s.researchDone.includes(req)) {
            get().notify(`Benötigt: ${RESEARCH[req]?.name ?? req}`, 'error'); return
          }
        }
        if (!canAfford(s.resources, def.cost)) { get().notify('Zu wenig Ressourcen!', 'error'); return }

        get().spendResources(def.cost)
        set((st) => { st.researchDone.push(id); st.stats.researched++ })

        // Handle special unlocks
        if (def.effect?.unlockBuilding) {
          // Building is now available — nothing else needed (cost check handles it)
        }

        get().addLog(`🔬 ${def.name} erforscht!`, 'research')
        get().notify(`${def.name} erforscht!`, 'success')
        get().checkQuestProgress('researched', 1)
      },

      // ── Summons ───────────────────────────────────────────────────────────
      summon: (id) => {
        const s   = get()
        const def = SUMMONS[id]
        if (!def) return
        // Check research prerequisites
        for (const req of (def.requires ?? [])) {
          if (!s.researchDone.includes(req)) {
            get().notify(`Benötigt Forschung: ${RESEARCH[req]?.name ?? req}`, 'error'); return
          }
        }
        const costMult = s.researchDone.includes('dunklePakte') ? 0.7 : 1.0
        const costs    = Object.fromEntries(Object.entries(def.cost).map(([k, v]) => [k, Math.floor(v * costMult)]))
        if (!canAfford(s.resources, costs)) { get().notify('Zu wenig Ressourcen!', 'error'); return }

        get().spendResources(costs)
        const instance = {
          instanceId: Date.now(),
          defId: id,
          name: def.name,
          icon: def.icon,
          tier: def.tier,
          stats: { ...def.stats },
          currentHp: def.stats.hp,
        }
        set((st) => { st.summons.push(instance); st.stats.summoned++ })
        get().addLog(`${def.icon} ${def.name} beschworen!`, 'summon')
        get().notify(`${def.name} erwacht!`, 'success')
        get().checkQuestProgress('summoned', 1)
      },

      dismissSummon: (instanceId) => {
        set((s) => { s.summons = s.summons.filter((u) => u.instanceId !== instanceId) })
        get().addLog('☠️ Ein Wesen wurde entlassen.', 'normal')
      },

      // ── Boss Fights ───────────────────────────────────────────────────────
      startBoss: (bossId) => {
        const s   = get()
        const def = BOSSES.find((b) => b.id === bossId)
        if (!def) return
        if (s.bossFight) { get().notify('Bereits ein Kampf aktiv!', 'error'); return }
        if (!canAfford(s.resources, def.unlockCost)) { get().notify('Zu wenig Ressourcen!', 'error'); return }
        if (s.summons.length === 0) { get().notify('Keine Wesen beschworen!', 'error'); return }

        get().spendResources(def.unlockCost)
        const fight = startBossFight(def)
        // Init summon HP
        for (const su of s.summons) fight.summonHp[su.instanceId] = su.stats.hp
        set((st) => { st.bossFight = fight })
        get().addLog(`⚔️ Kampf gegen ${def.name} beginnt!`, 'combat')
      },

      fleeBoss: () => {
        set((s) => { s.bossFight = null })
        get().addLog('🏃 Aus dem Kampf geflohen!', 'normal')
      },

      // ── Quests ───────────────────────────────────────────────────────────
      checkQuestProgress: (type, delta) => {
        set((s) => {
          advanceQuests(s.quests.daily, type, delta)
          advanceQuests(s.quests.milestones, type, delta)
        })
      },

      claimQuest: (questId, listKey) => {
        const s = get()
        const list = s.quests[listKey]
        const q = list?.find((x) => x.id === questId)
        if (!q || !q.completed || q.claimed) return

        get().addResources(q.reward)
        set((st) => {
          const found = st.quests[listKey].find((x) => x.id === questId)
          if (found) found.claimed = true
          if (listKey === 'milestones') st.quests.claimedMilestoneIds.push(questId)
        })
        get().addLog(`🎯 Quest "${q.title}" abgeschlossen!`, 'quest')
        get().notify(`${q.title} abgeschlossen!`, 'success')
      },

      checkQuestRefresh: () => {
        const s = get()
        if (s.quests.lastRefresh < getTodayStart()) {
          set((st) => {
            st.quests.daily = generateDailyQuests(st.prestige.count)
            st.quests.lastRefresh = getTodayStart()
          })
          get().addLog('📋 Neue Tagesquests verfügbar!', 'quest')
          get().notify('Neue Tagesquests! 📋', 'info')
        }
      },

      // ── Prestige / Aufstieg ───────────────────────────────────────────────
      canAscend: () => {
        const s = get()
        return s.resources.seelen >= PRESTIGE_THRESHOLD.seelen &&
               s.player.level >= PRESTIGE_THRESHOLD.level
      },

      calcAscensionMarks: () => {
        const s   = get()
        const base = Math.floor(s.resources.seelen / 10000)
        const mult = s.researchDone.includes('aufstiegVorbereitung') ? 2.0 : 1.0
        return Math.max(1, Math.floor(base * mult))
      },

      performAscension: () => {
        const s = get()
        if (!get().canAscend()) { get().notify('Voraussetzungen nicht erfüllt!', 'error'); return }
        const marks     = get().calcAscensionMarks()
        const newCount  = s.prestige.count + 1
        const totalMarks = s.prestige.abyssMarksTotal + marks
        const claimedMilestoneIds = [...s.quests.claimedMilestoneIds]

        const prevLog = s.log.slice(0, 6)
        set(() => ({
          ...INITIAL(newCount, claimedMilestoneIds),
          prestige: { count: newCount, abyssMarksTotal: totalMarks, ascendedAt: [...s.prestige.ascendedAt, Date.now()] },
          // Keep abyss marks in resources
          resources: { ...freshResources(), abyssMarken: totalMarks },
          stats: { ...INITIAL().stats, ascensions: newCount },
          log: [
            { id: 0, msg: `⬡ Aufstieg #${newCount}! +${marks} Abyss-Marken. Total: ${totalMarks} ⬡`, type: 'prestige', ts: Date.now() },
            ...prevLog,
          ],
          logId: 10,
          lastSaveTime: Date.now(),
        }))
        get().notify(`⬡ Aufstieg #${newCount}! +${marks} Abyss-Marken`, 'success')
      },

      // ── Update info (set by Electron listener in App.jsx) ────────────────
      setUpdateInfo: (info) => set((s) => { s.updateInfo = info }),
      clearUpdateInfo: ()   => set((s) => { s.updateInfo = null }),

      // ── Offline production ────────────────────────────────────────────────
      applyOfflineProduction: () => {
        const s = get()
        const now = Date.now()
        const offlineMs = now - (s.lastSaveTime ?? now)
        if (offlineMs < 10_000) return  // ignore if less than 10s

        const maxOfflineMs = (MAX_OFFLINE_BASE_H + (s.researchDone.includes('endloseBuchfuehrung') ? 12 : 0)) * 3_600_000
        const rates  = calcProductionRates(s)
        const result = calcOfflineProduction(rates, offlineMs, maxOfflineMs)
        if (Object.keys(result.gained).length === 0) return

        get().addResources(result.gained)
        set((st) => { st.lastSaveTime = now; st.offlineResult = result })
        get().addLog(`😴 Offline ${Math.round(result.seconds / 60)}min: Produktion eingesammelt.`, 'system')
      },

      dismissOfflineResult: () => set((s) => { s.offlineResult = null }),

      // ── Game tick ─────────────────────────────────────────────────────────
      tick: (delta) => {
        const s = get()
        set((st) => { st.stats.totalPlayTime += delta })

        // Production (delta in ms → convert to seconds)
        const rates = calcProductionRates(s)
        const gained = {}
        const sec = delta / 1000
        for (const [res, rate] of Object.entries(rates)) {
          const amount = rate * sec
          if (amount > 0) gained[res] = amount
        }
        if (Object.keys(gained).length) get().addResources(gained)

        // Update last save time
        set((st) => { st.lastSaveTime = Date.now() })

        // Sync resource quests
        set((st) => {
          syncResourceQuests(st.quests.daily, st.totalCollected)
          syncResourceQuests(st.quests.milestones, st.totalCollected)
        })

        // Sync all quests (resource + stat based) every tick
        set((st) => {
          syncAllQuests(st.quests.daily,      st.totalCollected, st.stats)
          syncAllQuests(st.quests.milestones, st.totalCollected, st.stats)
        })

        // Quest daily refresh (check ~every 60s)
        if (Math.random() < 1 / 60) get().checkQuestRefresh()

        // Achievement check (every ~10s)
        if (Math.random() < 1 / 10) get().checkAchievements()

        // Clean up expired buffs
        const nowMs = Date.now()
        set((st) => { st.activeBuffs = (st.activeBuffs || []).filter((b) => b.endsAt > nowMs) })

        // Fire random event
        if (!s.activeEvent && nowMs >= (s.nextEventAt ?? 0)) {
          const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)]
          set((st) => {
            st.activeEvent  = { ...ev, firedAt: nowMs }
            st.nextEventAt  = nowMs + get().nextEventDelay()
          })
        }

        // Boss combat
        if (s.bossFight) {
          set((st) => {
            if (!st.bossFight) return
            st.bossFight.tickCount++
            if (st.bossFight.tickCount < st.bossFight.ticksPerCombatRound) return

            st.bossFight.tickCount = 0
            const result = combatTick(st.summons, st.bossFight, st.researchDone)
            if (!result) return

            st.bossFight.currentHp = Math.max(0, st.bossFight.currentHp - result.playerDmg)

            // Damage summons
            if (st.summons.length > 0) {
              const target = st.summons[Math.floor(Math.random() * st.summons.length)]
              target.currentHp = Math.max(0, (target.currentHp ?? target.stats.hp) - result.bossDmg)
              if (target.currentHp <= 0) {
                st.summons = st.summons.filter((u) => u.instanceId !== target.instanceId)
              }
            }
          })

          // Check boss death AFTER state update
          const fight = get().bossFight
          if (fight && fight.currentHp <= 0) {
            get().addResources(fight.reward)
            set((st) => { st.bossFight = null; st.stats.bossKilled++ })
            get().addLog(`💀 ${fight.bossName} wurde besiegt!`, 'combat')
            get().notify(`${fight.bossName} besiegt!`, 'success')
            get().checkQuestProgress('bossKilled', 1)
          }

          // Wipe if no summons remain
          if (get().summons.length === 0 && get().bossFight) {
            const fn = get().bossFight.bossName
            set((st) => { st.bossFight = null })
            get().addLog(`💀 Alle Wesen gefallen! ${fn} hat gewonnen.`, 'combat')
            get().notify('Niederlage — alle Wesen gefallen!', 'error')
          }
        }
      },

      // ── Hard reset ────────────────────────────────────────────────────────
      hardReset: () => {
        set(() => ({ ...INITIAL(), buildings: freshBuildings(), lastSaveTime: Date.now() }))
      },
    })),
    {
      name: SAVE_KEY,
      // merge: deep-merge saved state into initial state so NEW fields added
      // in future versions get their defaults instead of being undefined.
      merge: (persisted, current) => {
        const p = persisted ?? {}
        return {
          ...current,
          // Core game state — always restore from save
          resources:     { ...current.resources,     ...(p.resources     ?? {}) },
          buildings:     { ...current.buildings,     ...(p.buildings     ?? {}) },
          researchDone:  p.researchDone  ?? current.researchDone,
          summons:       p.summons       ?? current.summons,
          totalCollected:{ ...current.totalCollected, ...(p.totalCollected ?? {}) },
          stats:         { ...current.stats,         ...(p.stats         ?? {}) },
          player:        { ...current.player,        ...(p.player        ?? {}) },
          prestige:      { ...current.prestige,      ...(p.prestige      ?? {}) },
          quests:        p.quests        ?? current.quests,
          tutorial:      { ...current.tutorial,      ...(p.tutorial      ?? {}) },
          // Settings: merge so new settings get defaults but existing prefs survive
          settings:      { ...current.settings,      ...(p.settings      ?? {}) },
          // Achievements: merge so new achievements list is recognized
          achievements:  { ...current.achievements,  ...(p.achievements  ?? {}) },
          lastSaveTime:  p.lastSaveTime  ?? current.lastSaveTime,
          log:           p.log           ?? current.log,
          logId:         p.logId         ?? current.logId,
        }
      },
      partialize: (s) => ({
        resources:     s.resources,
        buildings:     s.buildings,
        researchDone:  s.researchDone,
        summons:       s.summons,
        totalCollected:s.totalCollected,
        stats:         s.stats,
        player:        s.player,
        prestige:      s.prestige,
        quests:        s.quests,
        tutorial:      s.tutorial,
        settings:      s.settings,
        achievements:  s.achievements,
        lastSaveTime:  s.lastSaveTime,
        log:           s.log.slice(0, 50),
        logId:         s.logId,
      }),
    }
  )
)
