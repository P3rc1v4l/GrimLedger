import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { useGameLoop }  from './hooks/useGameLoop'

import NavSidebar    from './components/hud/NavSidebar'
import RightSidebar  from './components/hud/RightSidebar'
import TutorialOverlay from './components/hud/TutorialOverlay'

import DashboardPanel   from './components/panels/DashboardPanel'
import ResourcesPanel   from './components/panels/ResourcesPanel'
import BuildingsPanel   from './components/panels/BuildingsPanel'
import ResearchPanel    from './components/panels/ResearchPanel'
import SummoningPanel   from './components/panels/SummoningPanel'
import BossPanel        from './components/panels/BossPanel'
import QuestPanel       from './components/panels/QuestPanel'
import AscensionPanel   from './components/panels/AscensionPanel'
import SettingsPanel    from './components/panels/SettingsPanel'

import Notification  from './components/ui/Notification'
import UpdateBanner  from './components/ui/UpdateBanner'
import OfflineModal  from './components/ui/OfflineModal'

const PANELS = {
  dashboard:     <DashboardPanel />,
  ressourcen:    <ResourcesPanel />,
  gebaeude:      <BuildingsPanel />,
  forschung:     <ResearchPanel />,
  beschwoerung:  <SummoningPanel />,
  bosse:         <BossPanel />,
  quests:        <QuestPanel />,
  aufstieg:      <AscensionPanel />,
  einstellungen: <SettingsPanel />,
}

export default function App() {
  useGameLoop()

  const { activePanel, setUpdateInfo, applyOfflineProduction } = useGameStore((s) => ({
    activePanel: s.activePanel,
    setUpdateInfo: s.setUpdateInfo,
    applyOfflineProduction: s.applyOfflineProduction,
  }))

  useEffect(() => { applyOfflineProduction() }, []) // eslint-disable-line

  useEffect(() => {
    const api = window.electronAPI
    if (!api) return
    api.onUpdateAvailable((info) => setUpdateInfo({ status: 'available', version: info.version }))
    api.onUpdateNotAvailable(() => setUpdateInfo({ status: 'not-available', version: null }))
    api.onDownloadProgress((p) => setUpdateInfo({ status: 'downloading', progress: p.percent }))
    api.onUpdateDownloaded(() => setUpdateInfo({ status: 'downloaded' }))
    api.onUpdateError((msg) => setUpdateInfo({ status: 'error', message: msg }))
  }, []) // eslint-disable-line

  return (
    <div className="app-shell">
      <div className="app-body">
        <NavSidebar />
        <main className="app-main" key={activePanel}>
          {PANELS[activePanel] ?? <DashboardPanel />}
        </main>
        <RightSidebar />
      </div>
      <Notification />
      <UpdateBanner />
      <OfflineModal />
      <TutorialOverlay />
    </div>
  )
}
