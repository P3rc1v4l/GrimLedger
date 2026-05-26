import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import {
  BUILDINGS, RESEARCH, SUMMONS, BOSSES, ACHIEVEMENTS, EVENTS,
  ASCENSION_REQ, ASCENSION_BONUSES,
  SAVE_KEY, TICK_MS, EVENT_MIN_MS, EVENT_MAX_MS, xpToNext,
} from '../utils/constants'
import { canAfford, randInt, getTodayMs } from '../utils/helpers'
import { calcRates, calcOffline, calcPrestigeMult, calcAchBonus } from '../systems/production'
import { makeDailyQuests, makeMilestones, syncQuests } from '../systems/quests'
import { combatRound, makeBossFight } from '../systems/combat'

// ── State factories ───────────────────────────────────────────────────────────
const mkResources = () => ({
  seelen: 10, knochen: 0, blut: 0, schatten: 0,
  erinnerungen: 0, asche: 0, wissen: 0, albtraeume: 0,
  leereFragmente: 0, gottloseEssenz: 0, abyssMarken: 0,
})

const mkBuildings = () =>
  Object.fromEntries(Object.entries(BUILDINGS).map(([id, d]) => [id, { level: d.startLevel }]))

const mkTotalCollected = () => ({
  seelen: 0, knochen: 0, blut: 0, schatten: 0,
  erinnerungen: 0, asche: 0, wissen: 0, albtraeume: 0,
  leereFragmente: 0, gottloseEssenz: 0,
})

const mkStats = (ascensions = 0) => ({
  researched: 0, summoned: 0, bossKilled: 0, upgraded: 0,
  ascensions, playTime: 0,
})

// Settings live OUTSIDE INITIAL so they survive ascension resets
const DEFAULT_SETTINGS = {
  compactNumbers:      false,
  showRates:           true,
  logMaxEntries:       80,
  offlineCapHours:     8,
}

// ── Game state that resets on ascension ───────────────────────────────────────
function mkRun(prestigeCount = 0, claimedMilestoneIds = []) {
  return {
    resources:     mkResources(),
    buildings:     mkBuildings(),
    researchDone:  [],
    summons:       [],
    bossFight:     null,
    totalCollected: mkTotalCollected(),
    stats:         mkStats(prestigeCount),
    player:        { level: 1, xp: 0, xpToNext: xpToNext(1) },
    quests: {
      daily:      makeDailyQuests(prestigeCount),
      milestones: makeMilestones(claimedMilestoneIds),
      lastRefresh: getTodayMs(),
      claimedIds:  [...claimedMilestoneIds],
    },
    activeBuffs:  [],
    activeEvent:  null,
    nextEventAt:  Date.now() + randInt(EVENT_MIN_MS, EVENT_MAX_MS),
    lastSaveTime: Date.now(),
    offlineResult: null,
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useGameStore = create(
  persist(
    immer((set, get) => ({
      // Run state
      ...mkRun(),

      // Permanent state (survives ascension)
      prestige: { count: 0, abyssTotal: 0, history: [] },
      achievements: { unlocked: [] },
      settings: { ...DEFAULT_SETTINGS },
      tutorial: { active: true, step: 0 },
      updateInfo: null,
      activePanel: 'dashboard',
      log: [
        { id: 0, msg: '📜 Das Grim Ledger öffnet sich...', type: 'system' },
        { id: 1, msg: '💡 Die Seelenquelle produziert automatisch Seelen.', type: 'tip' },
      ],
      logId: 2,
      notification: null,

      // ── Logging ────────────────────────────────────────────────────────────
      _log: (msg, type = 'normal') => set(s => {
        const max = s.settings.logMaxEntries ?? 80
        s.log.unshift({ id: s.logId++, msg, type })
        if (s.log.length > max) s.log.length = max
      }),

      notify: (msg, type = 'success') => {
        set(s => { s.notification = { msg, type, id: Date.now() } })
        setTimeout(() => set(s => { s.notification = null }), 3200)
      },

      // ── UI ─────────────────────────────────────────────────────────────────
      setPanel: (panel) => set(s => { s.activePanel = panel }),
      updateSettings: (patch) => set(s => { Object.assign(s.settings, patch) }),
      setUpdateInfo:  (info)  => set(s => { s.updateInfo = info }),

      // ── Tutorial ───────────────────────────────────────────────────────────
      advanceTutorial: () => set(s => { s.tutorial.step++ }),
      dismissTutorial: () => set(s => { s.tutorial.active = false }),
      resetTutorial:   () => set(s => { s.tutorial = { active: true, step: 0 }; s.activePanel = 'dashboard' }),

      // ── Resources ──────────────────────────────────────────────────────────
      _addResources: (gains) => set(s => {
        for (const [k, v] of Object.entries(gains)) {
          if (v <= 0 || !isFinite(v)) continue
          s.resources[k]       = (s.resources[k]       ?? 0) + v
          s.totalCollected[k]  = (s.totalCollected[k]  ?? 0) + v
        }
        // XP from seelen
        if (gains.seelen > 0) {
          s.player.xp += gains.seelen * 0.1
          while (s.player.xp >= s.player.xpToNext) {
            s.player.xp -= s.player.xpToNext
            s.player.level++
            s.player.xpToNext = xpToNext(s.player.level)
          }
        }
      }),

      _spend: (costs) => set(s => {
        for (const [k, v] of Object.entries(costs)) {
          s.resources[k] = Math.max(0, (s.resources[k] ?? 0) - v)
        }
      }),

      // ── Buildings ──────────────────────────────────────────────────────────
      buildOrUpgrade: (id) => {
        const s   = get()
        const b   = s.buildings[id]
        const def = BUILDINGS[id]
        if (!def || !b) return

        if (b.level >= def.maxLevel) { get().notify('Max. Level erreicht', 'error'); return }
        const isNew = b.level === 0
        const cost  = isNew ? def.unlockCost : def.upgradeCost(b.level + 1)
        if (!canAfford(s.resources, cost)) { get().notify('Zu wenig Ressourcen!', 'error'); return }

        if (cost) get()._spend(cost)
        set(s => { s.buildings[id].level++; s.stats.upgraded++ })

        const newLvl = get().buildings[id].level
        const msg = isNew ? `🏗️ ${def.name} errichtet!` : `⬆️ ${def.name} → Stufe ${newLvl}`
        get()._log(msg, 'upgrade')
        get().notify(msg, 'success')
      },

      // ── Research ───────────────────────────────────────────────────────────
      research: (id) => {
        const s   = get()
        const def = RESEARCH[id]
        if (!def || s.researchDone.includes(id)) return
        for (const req of def.requires) {
          if (!s.researchDone.includes(req)) {
            get().notify(`Benötigt: ${RESEARCH[req]?.name ?? req}`, 'error'); return
          }
        }
        if (!canAfford(s.resources, def.cost)) { get().notify('Zu wenig Ressourcen!', 'error'); return }
        get()._spend(def.cost)
        set(s => { s.researchDone.push(id); s.stats.researched++ })
        get()._log(`🔬 ${def.name} erforscht!`, 'research')
        get().notify(`${def.name} erforscht!`, 'success')
      },

      // ── Summons ────────────────────────────────────────────────────────────
      summon: (id) => {
        const s   = get()
        const def = SUMMONS[id]
        if (!def) return
        for (const req of def.requires) {
          if (!s.researchDone.includes(req)) {
            get().notify(`Benötigt: ${RESEARCH[req]?.name ?? req}`, 'error'); return
          }
        }
        const disc  = s.researchDone.includes('dunklePakte') ? 0.7 : 1.0
        const costs = Object.fromEntries(Object.entries(def.cost).map(([k, v]) => [k, Math.floor(v * disc)]))
        if (!canAfford(s.resources, costs)) { get().notify('Zu wenig Ressourcen!', 'error'); return }
        get()._spend(costs)
        const inst = { id: Date.now(), defId: id, name: def.name, icon: def.icon, tier: def.tier, stats: { ...def.stats }, hp: def.stats.hp }
        set(s => { s.summons.push(inst); s.stats.summoned++ })
        get()._log(`${def.icon} ${def.name} beschworen!`, 'summon')
        get().notify(`${def.name} erwacht!`, 'success')
      },

      dismissSummon: (id) => {
        set(s => { s.summons = s.summons.filter(u => u.id !== id) })
        get()._log('☠️ Wesen entlassen.', 'normal')
      },

      // ── Boss ───────────────────────────────────────────────────────────────
      startBoss: (bossId) => {
        const s   = get()
        const def = BOSSES.find(b => b.id === bossId)
        if (!def) return
        if (s.bossFight)               { get().notify('Bereits ein Kampf aktiv!', 'error'); return }
        if (s.summons.length === 0)    { get().notify('Keine Wesen beschworen!', 'error'); return }
        if (!canAfford(s.resources, def.unlockCost)) { get().notify('Zu wenig Ressourcen!', 'error'); return }
        get()._spend(def.unlockCost)
        set(s => { s.bossFight = makeBossFight(def) })
        get()._log(`⚔️ Kampf gegen ${def.name} beginnt!`, 'combat')
      },

      fleeBoss: () => {
        set(s => { s.bossFight = null })
        get()._log('🏃 Aus dem Kampf geflohen.', 'normal')
      },

      // ── Quests ─────────────────────────────────────────────────────────────
      claimQuest: (questId, list) => {
        const s = get()
        const q = s.quests[list]?.find(x => x.id === questId)
        if (!q || !q.completed || q.claimed) return
        get()._addResources(q.reward)
        set(s => {
          const found = s.quests[list].find(x => x.id === questId)
          if (found) found.claimed = true
          if (list === 'milestones') s.quests.claimedIds.push(questId)
        })
        get()._log(`🎯 "${q.title}" abgeschlossen!`, 'quest')
        get().notify(`${q.title}!`, 'success')
      },

      // ── Events ─────────────────────────────────────────────────────────────
      acceptEvent: () => {
        const ev = get().activeEvent
        if (!ev) return
        const { accept } = ev

        if (accept.instant) get()._addResources(accept.instant)
        if (accept.lossFrac) {
          set(s => {
            for (const [k, frac] of Object.entries(accept.lossFrac)) {
              const loss = Math.floor((s.resources[k] ?? 0) * frac)
              s.resources[k] = Math.max(0, (s.resources[k] ?? 0) - loss)
            }
          })
        }
        if (accept.buff) {
          const endsAt = Date.now() + accept.buff.duration * 1000
          set(s => { s.activeBuffs.push({ type: accept.buff.type, value: accept.buff.value, endsAt }) })
        }

        get()._log(`${ev.icon} ${ev.title} angenommen.`, 'event')
        set(s => { s.activeEvent = null; s.nextEventAt = Date.now() + randInt(EVENT_MIN_MS, EVENT_MAX_MS) })
      },

      rejectEvent: () => {
        const s  = get()
        const ev = s.activeEvent
        if (!ev) return

        if (ev.rejectCost) {
          if (!canAfford(s.resources, ev.rejectCost)) {
            // Can't afford reject cost → forced accept
            get().acceptEvent(); return
          }
          get()._spend(ev.rejectCost)
          get()._log(`${ev.icon} ${ev.title} abgewehrt.`, 'event')
        } else {
          get()._log(`${ev.icon} ${ev.title} abgelehnt.`, 'event')
        }

        set(s => { s.activeEvent = null; s.nextEventAt = Date.now() + randInt(EVENT_MIN_MS, EVENT_MAX_MS) })
      },

      // ── Achievements ────────────────────────────────────────────────────────
      _checkAchievements: () => {
        const s   = get()
        const col = s.totalCollected
        const st  = s.stats
        const got = s.achievements.unlocked

        const newly = ACHIEVEMENTS.filter(a => {
          if (got.includes(a.id)) return false
          let cur = 0
          if (a.type in col)           cur = col[a.type] ?? 0
          else if (a.type === 'playTime') cur = st.playTime ?? 0
          else if (a.type in st)       cur = st[a.type] ?? 0
          return cur >= a.goal
        })

        if (!newly.length) return
        set(s => { s.achievements.unlocked.push(...newly.map(a => a.id)) })
        for (const a of newly) {
          get()._log(`🏆 Achievement: "${a.title}" — ${a.label}`, 'achievement')
          get().notify(`🏆 ${a.title}`, 'success')
        }
      },

      // ── Ascension ──────────────────────────────────────────────────────────
      canAscend: () => {
        const s = get()
        return s.resources.seelen >= ASCENSION_REQ.seelen && s.player.level >= ASCENSION_REQ.level
      },

      ascensionMarks: () => {
        const s    = get()
        const base = Math.floor(s.resources.seelen / 10000)
        const mult = s.researchDone.includes('aufstiegVorbereitung') ? 2.0 : 1.0
        return Math.max(1, Math.floor(base * mult))
      },

      performAscension: () => {
        const s = get()
        if (!get().canAscend()) { get().notify('Voraussetzungen fehlen!', 'error'); return }
        const marks    = get().ascensionMarks()
        const newCount = s.prestige.count + 1
        const total    = s.prestige.abyssTotal + marks
        const claimedIds = [...s.quests.claimedIds]
        const prevLog  = s.log.slice(0, 5)

        const newRun = mkRun(newCount, claimedIds)
        set(s => {
          Object.assign(s, newRun)
          s.prestige = { count: newCount, abyssTotal: total, history: [...s.prestige.history, { at: Date.now(), marks }] }
          s.resources.abyssMarken = total
          s.stats.ascensions = newCount
          s.activePanel = 'dashboard'
          s.log = [
            { id: 0, msg: `⬡ Aufstieg #${newCount}! +${marks} Abyss-Marken (Total: ${total})`, type: 'prestige' },
            ...prevLog,
          ]
          s.logId = 10
        })
        get().notify(`⬡ Aufstieg #${newCount}! +${marks} Abyss-Marken`, 'success')
      },

      // ── Save / Export / Import ──────────────────────────────────────────────
      exportSave: () => {
        const s = get()
        const data = {
          _version: '1.0.0',
          _exportedAt: new Date().toISOString(),
          resources: s.resources, buildings: s.buildings,
          researchDone: s.researchDone, summons: s.summons,
          totalCollected: s.totalCollected, stats: s.stats,
          player: s.player, prestige: s.prestige,
          quests: s.quests, achievements: s.achievements,
          settings: s.settings,
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url  = URL.createObjectURL(blob)
        const a    = Object.assign(document.createElement('a'), {
          href: url,
          download: `GrimLedger-${new Date().toISOString().slice(0,10)}.json`,
        })
        a.click()
        URL.revokeObjectURL(url)
        get().notify('Spielstand exportiert!', 'success')
      },

      importSave: (json) => {
        try {
          const d = JSON.parse(json)
          if (!d.resources || !d.buildings) throw new Error('Ungültig')
          set(s => {
            if (d.resources)      s.resources      = d.resources
            if (d.buildings)      s.buildings      = d.buildings
            if (d.researchDone)   s.researchDone   = d.researchDone
            if (d.summons)        s.summons        = d.summons
            if (d.totalCollected) s.totalCollected = d.totalCollected
            if (d.stats)          s.stats          = d.stats
            if (d.player)         s.player         = d.player
            if (d.prestige)       s.prestige       = d.prestige
            if (d.quests)         s.quests         = d.quests
            if (d.achievements)   s.achievements   = d.achievements
            if (d.settings)       Object.assign(s.settings, d.settings)
          })
          get()._log('📂 Spielstand importiert.', 'system')
          get().notify('Spielstand geladen!', 'success')
        } catch (e) {
          get().notify(`Import fehlgeschlagen: ${e.message}`, 'error')
        }
      },

      // ── Offline production ──────────────────────────────────────────────────
      applyOffline: () => {
        const s   = get()
        const now = Date.now()
        const ms  = now - (s.lastSaveTime ?? now)
        if (ms < 15_000) return  // skip < 15s

        const bonusH    = s.researchDone.includes('endloseBuchfuehrung') ? 12 : 0
        const capH      = (s.settings.offlineCapHours ?? 8) + bonusH
        const rates     = calcRates(s)
        const result    = calcOffline(rates, ms, capH * 3_600_000)
        const hasGains  = Object.keys(result.gained).length > 0

        if (hasGains) {
          get()._addResources(result.gained)
          set(s => { s.offlineResult = result; s.lastSaveTime = now })
          get()._log(`😴 Offline ${Math.round(result.seconds / 60)}min — Produktion gesammelt.`, 'system')
        }
      },

      clearOfflineResult: () => set(s => { s.offlineResult = null }),

      // ── Hard reset ──────────────────────────────────────────────────────────
      hardReset: () => set(s => {
        const fresh = mkRun()
        Object.assign(s, fresh)
        s.prestige     = { count: 0, abyssTotal: 0, history: [] }
        s.achievements = { unlocked: [] }
        s.settings     = { ...DEFAULT_SETTINGS }
        s.tutorial     = { active: true, step: 0 }
        s.activePanel  = 'dashboard'
        s.log          = [{ id: 0, msg: '📜 Neues Spiel gestartet.', type: 'system' }]
        s.logId        = 1
        s.notification = null
        s.updateInfo   = null
      }),

      // ── Game tick ───────────────────────────────────────────────────────────
      tick: (delta) => {
        const s   = get()
        const sec = delta / 1000
        const now = Date.now()

        // Playtime
        set(s => { s.stats.playTime += delta; s.lastSaveTime = now })

        // Production
        const rates  = calcRates(s)
        const gained = {}
        for (const [k, r] of Object.entries(rates)) {
          const amt = r * sec
          if (amt > 0.0001) gained[k] = amt
        }
        if (Object.keys(gained).length) get()._addResources(gained)

        // Sync all quests (once per tick — single call, no duplicates)
        set(s => {
          syncQuests(s.quests.daily,      s.totalCollected, s.stats)
          syncQuests(s.quests.milestones, s.totalCollected, s.stats)
        })

        // Quest daily refresh (throttled)
        if (Math.random() < 1 / 60) {
          const st = get()
          if (st.quests.lastRefresh < getTodayMs()) {
            set(s => { s.quests.daily = makeDailyQuests(s.prestige.count); s.quests.lastRefresh = getTodayMs() })
            get()._log('📋 Neue Tagesquests!', 'quest')
            get().notify('Neue Tagesquests! 📋', 'info')
          }
        }

        // Achievements (throttled)
        if (Math.random() < 1 / 20) get()._checkAchievements()

        // Expire buffs
        set(s => { s.activeBuffs = s.activeBuffs.filter(b => b.endsAt > now) })

        // Fire event
        if (!s.activeEvent && now >= s.nextEventAt) {
          const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)]
          set(s => { s.activeEvent = { ...ev } })
        }

        // Boss combat
        if (s.bossFight) {
          let dead = false, defeated = false
          set(s => {
            if (!s.bossFight) return
            s.bossFight.roundTick++
            if (s.bossFight.roundTick < s.bossFight.roundEvery) return
            s.bossFight.roundTick = 0

            const result = combatRound(s.summons, s.bossFight, s.researchDone)
            if (!result) return

            s.bossFight.hp = Math.max(0, s.bossFight.hp - result.playerDmg)
            if (s.bossFight.hp <= 0) { dead = true; return }

            // Damage random summon
            if (s.summons.length > 0) {
              const idx    = Math.floor(Math.random() * s.summons.length)
              const target = s.summons[idx]
              target.hp = Math.max(0, (target.hp ?? target.stats.hp) - result.bossDmg)
              if (target.hp <= 0) {
                s.summons.splice(idx, 1)
                if (s.summons.length === 0) defeated = true
              }
            }
          })

          if (dead) {
            const fight = get().bossFight
            get()._addResources(fight.reward)
            set(s => { s.bossFight = null; s.stats.bossKilled++ })
            get()._log(`💀 ${fight.bossName} besiegt!`, 'combat')
            get().notify(`${fight.bossName} besiegt!`, 'success')
          } else if (defeated) {
            const name = get().bossFight?.bossName ?? '?'
            set(s => { s.bossFight = null })
            get()._log(`💀 Alle Wesen gefallen! ${name} hat gewonnen.`, 'combat')
            get().notify('Niederlage!', 'error')
          }
        }
      },
    })),
    {
      name: SAVE_KEY,
      // Deep merge: saved data is merged INTO fresh initial state.
      // This means new fields always get their defaults, old data survives.
      merge: (saved, fresh) => {
        if (!saved) return fresh
        const p = saved
        return {
          ...fresh,
          resources:      { ...fresh.resources,      ...(p.resources      ?? {}) },
          buildings:      { ...fresh.buildings,      ...(p.buildings      ?? {}) },
          researchDone:   p.researchDone   ?? fresh.researchDone,
          summons:        p.summons        ?? fresh.summons,
          bossFight:      null,  // never restore mid-fight
          totalCollected: { ...fresh.totalCollected, ...(p.totalCollected ?? {}) },
          stats:          { ...fresh.stats,          ...(p.stats          ?? {}) },
          player:         { ...fresh.player,         ...(p.player         ?? {}) },
          prestige:       { ...fresh.prestige,       ...(p.prestige       ?? {}) },
          achievements:   { ...fresh.achievements,   ...(p.achievements   ?? {}) },
          quests:         p.quests    ?? fresh.quests,
          settings:       { ...fresh.settings,       ...(p.settings       ?? {}) },
          tutorial:       { ...fresh.tutorial,       ...(p.tutorial       ?? {}) },
          log:            p.log       ?? fresh.log,
          logId:          p.logId     ?? fresh.logId,
          lastSaveTime:   p.lastSaveTime ?? Date.now(),
          activeBuffs:    [],     // don't restore event buffs — expired
          activeEvent:    null,   // don't restore pending event
          nextEventAt:    Date.now() + 60_000,  // 1min after load
          offlineResult:  null,
          notification:   null,
          updateInfo:     null,
          activePanel:    p.activePanel ?? 'dashboard',
        }
      },
      partialize: s => ({
        resources: s.resources, buildings: s.buildings,
        researchDone: s.researchDone, summons: s.summons,
        totalCollected: s.totalCollected, stats: s.stats,
        player: s.player, prestige: s.prestige,
        achievements: s.achievements, quests: s.quests,
        settings: s.settings, tutorial: s.tutorial,
        log: s.log.slice(0, 60), logId: s.logId,
        lastSaveTime: s.lastSaveTime, activePanel: s.activePanel,
      }),
    }
  )
)
