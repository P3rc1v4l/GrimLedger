import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { useGameLoop } from './hooks/useGameLoop'

// Layout
import NavSidebar   from './components/hud/NavSidebar'
import RightSidebar from './components/hud/RightSidebar'

// Panels
import DashboardPanel  from './components/panels/DashboardPanel'
import ResourcesPanel  from './components/panels/ResourcesPanel'
import BuildingsPanel  from './components/panels/BuildingsPanel'
import ResearchPanel   from './components/panels/ResearchPanel'
import SummoningPanel  from './components/panels/SummoningPanel'
import BossPanel       from './components/panels/BossPanel'
import QuestPanel      from './components/panels/QuestPanel'
import AscensionPanel  from './components/panels/AscensionPanel'
import SettingsPanel   from './components/panels/SettingsPanel'

// UI overlays
import Notification  from './components/ui/Notification'
import UpdateBanner  from './components/ui/UpdateBanner'
import OfflineModal  from './components/ui/OfflineModal'

const PANELS = {
  dashboard:    <DashboardPanel />,
  ressourcen:   <ResourcesPanel />,
  gebaeude:     <BuildingsPanel />,
  forschung:    <ResearchPanel />,
  beschwoerung: <SummoningPanel />,
  bosse:        <BossPanel />,
  quests:       <QuestPanel />,
  aufstieg:     <AscensionPanel />,
  einstellungen:<SettingsPanel />,
}

export default function App() {
  useGameLoop()

  const { activePanel, setUpdateInfo, applyOfflineProduction } = useGameStore((s) => ({
    activePanel: s.activePanel,
    setUpdateInfo: s.setUpdateInfo,
    applyOfflineProduction: s.applyOfflineProduction,
  }))

  // Apply offline production on first load
  useEffect(() => {
    applyOfflineProduction()
  }, [])  // eslint-disable-line

  // Wire Electron IPC update events
  useEffect(() => {
    const api = window.electronAPI
    if (!api) return

    api.onUpdateAvailable((info) => {
      setUpdateInfo({ status: 'available', version: info.version })
    })
    api.onUpdateNotAvailable(() => {
      setUpdateInfo({ status: 'not-available', version: null })
      // Clear "not available" after 5s so it doesn't clutter settings forever
      setTimeout(() => setUpdateInfo({ status: 'not-available', version: null }), 5000)
    })
    api.onDownloadProgress((p) => {
      setUpdateInfo((prev) => ({ ...prev, status: 'downloading', progress: p.percent }))
    })
    api.onUpdateDownloaded(() => {
      setUpdateInfo((prev) => ({ ...prev, status: 'downloaded' }))
    })
    api.onUpdateError((msg) => {
      setUpdateInfo({ status: 'error', message: msg })
    })
  }, [])  // eslint-disable-line

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#080608]">
      <div className="flex-1 flex overflow-hidden">
        {/* Left nav */}
        <NavSidebar />

        {/* Main content */}
        <main className="flex-1 overflow-hidden p-3" key={activePanel}>
          <div className="h-full animate-fadeIn">
            {PANELS[activePanel] ?? <DashboardPanel />}
          </div>
        </main>

        {/* Right sidebar */}
        <RightSidebar />
      </div>

      {/* Overlays */}
      <Notification />
      <UpdateBanner />
      <OfflineModal />
    </div>
  )
}
