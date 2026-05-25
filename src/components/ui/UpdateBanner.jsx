import { useGameStore } from '../../store/gameStore'
import { useState } from 'react'

export default function UpdateBanner() {
  const { updateInfo, setUpdateInfo } = useGameStore((s) => ({
    updateInfo: s.updateInfo,
    setUpdateInfo: s.setUpdateInfo,
  }))
  const [dismissed, setDismissed] = useState(false)

  if (!updateInfo || dismissed) return null

  const api = window.electronAPI

  const handleDownload = () => {
    api?.downloadUpdate()
    setUpdateInfo({ ...updateInfo, status: 'downloading', progress: 0 })
  }

  const handleInstall = () => api?.installUpdate()

  const { status, version, progress } = updateInfo

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold-dark/40 bg-[#0d0a04] px-4 py-2.5 flex items-center gap-4">
      <span className="text-gold animate-flicker text-sm">⬡</span>
      <div className="flex-1 font-mono text-xs text-[#c8b89a]">
        {status === 'available'   && `Update v${version} verfügbar`}
        {status === 'downloading' && `Download: ${Math.round(progress ?? 0)}%`}
        {status === 'downloaded'  && `v${version} heruntergeladen — bereit zur Installation`}
        {status === 'error'       && 'Update-Prüfung fehlgeschlagen'}
      </div>
      {status === 'available' && (
        <button onClick={handleDownload} className="btn-gold text-xs">
          Herunterladen
        </button>
      )}
      {status === 'downloaded' && (
        <button onClick={handleInstall} className="btn-gold text-xs animate-flicker">
          Jetzt installieren & neu starten
        </button>
      )}
      <button onClick={() => setDismissed(true)} className="text-ash hover:text-[#c8b89a] font-mono text-xs">✕</button>
    </div>
  )
}
