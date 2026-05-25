import { useGameStore } from './store/gameStore'
import { useGameLoop } from './hooks/useGameLoop'
import HUD from './components/hud/HUD'
import TabNav from './components/hud/TabNav'
import Notification from './components/ui/Notification'
import TutorialOverlay from './components/tutorial/TutorialOverlay'
import TavernPanel from './components/panels/TavernPanel'
import ShopPanel from './components/panels/ShopPanel'
import ForgePanel from './components/panels/ForgePanel'
import DungeonPanel from './components/panels/DungeonPanel'
import CryptPanel from './components/panels/CryptPanel'
import PrestigePanel from './components/panels/PrestigePanel'
import LogPanel from './components/panels/LogPanel'

const PANELS = {
  tavern:   <TavernPanel />,
  shop:     <ShopPanel />,
  forge:    <ForgePanel />,
  dungeon:  <DungeonPanel />,
  crypt:    <CryptPanel />,
  prestige: <PrestigePanel />,
  log:      <LogPanel />,
}

export default function App() {
  useGameLoop()
  const { activeTab, hardReset } = useGameStore((s) => ({ activeTab: s.activeTab, hardReset: s.hardReset }))

  return (
    <div className="min-h-screen flex flex-col select-none">
      <HUD />
      <main className="flex-1 max-w-2xl mx-auto w-full px-3 py-4 flex flex-col gap-4">
        <TabNav />
        <div className="flex-1 animate-slideIn" key={activeTab}>
          {PANELS[activeTab] ?? <TavernPanel />}
        </div>
        <div className="pb-4 text-center">
          <button
            onClick={() => { if (window.confirm('Spielstand komplett löschen? Alle Prestige-Daten gehen verloren!')) hardReset() }}
            className="font-mono text-xs text-stone-700 hover:text-red-700 transition-colors"
          >
            Spielstand löschen
          </button>
        </div>
      </main>
      <Notification />
      <TutorialOverlay />
    </div>
  )
}
