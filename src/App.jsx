import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { useGameLoop }  from './hooks/useGameLoop'

import NavSidebar    from './components/hud/NavSidebar'
import RightSidebar  from './components/hud/RightSidebar'
import TutorialOverlay from './components/hud/TutorialOverlay'

import DashboardPanel    from './components/panels/DashboardPanel'
import ResourcesPanel    from './components/panels/ResourcesPanel'
import BuildingsPanel    from './components/panels/BuildingsPanel'
import ResearchPanel     from './components/panels/ResearchPanel'
import SummoningPanel    from './components/panels/SummoningPanel'
import BossPanel         from './components/panels/BossPanel'
import QuestPanel        from './components/panels/QuestPanel'
import AchievementsPanel from './components/panels/AchievementsPanel'
import AscensionPanel    from './components/panels/AscensionPanel'
import SettingsPanel     from './components/panels/SettingsPanel'

import Notification  from './components/ui/Notification'
import UpdateBanner  from './components/ui/UpdateBanner'
import OfflineModal  from './components/ui/OfflineModal'
import EventModal    from './components/ui/EventModal'

const PANELS = {
  dashboard:    <DashboardPanel />,
  ressourcen:   <ResourcesPanel />,
  gebaeude:     <BuildingsPanel />,
  forschung:    <ResearchPanel />,
  beschwoerung: <SummoningPanel />,
  bosse:        <BossPanel />,
  quests:       <QuestPanel />,
  achievements: <AchievementsPanel />,
  aufstieg:     <AscensionPanel />,
  einstellungen:<SettingsPanel />,
}

export default function App() {
  useGameLoop()

  const activePanel    = useGameStore(s => s.activePanel)
  const setUpdateInfo  = useGameStore(s => s.setUpdateInfo)
  const applyOffline   = useGameStore(s => s.applyOffline)

  // Apply offline production on first load
  useEffect(() => { applyOffline() }, []) // eslint-disable-line

  // Wire Electron IPC update events
  useEffect(() => {
    const api = window.api
    if (!api) return
    api.on('update-available',    d => setUpdateInfo({ status: 'available',    version: d?.version }))
    api.on('update-not-available',  () => setUpdateInfo({ status: 'not-available', version: null }))
    api.on('update-progress',     d => setUpdateInfo({ status: 'downloading',  progress: d?.percent }))
    api.on('update-downloaded',     () => setUpdateInfo({ status: 'downloaded',   version: null }))
    api.on('update-error',        m => setUpdateInfo({ status: 'error',         message: m }))
  }, []) // eslint-disable-line

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#16101e' }}>
      <NavSidebar />

      <main
        key={activePanel}
        className="anim-enter"
        style={{ flex: 1, minWidth: 0, overflow: 'hidden', padding: '12px', display: 'flex', flexDirection: 'column' }}
      >
        {PANELS[activePanel] ?? <DashboardPanel />}
      </main>

      <RightSidebar />

      {/* Overlays */}
      <Notification />
      <UpdateBanner />
      <OfflineModal />
      <EventModal />
      <TutorialOverlay />
    </div>
  )
}
