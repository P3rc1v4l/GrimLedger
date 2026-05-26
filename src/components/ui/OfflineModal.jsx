import { useGameStore } from '../../store/gameStore'
import { RES } from '../../utils/constants'
import { fmt, fmtTime } from '../../utils/helpers'
import { Btn, C } from './primitives'

export default function OfflineModal() {
  const { offlineResult, clearOfflineResult } = useGameStore(s => ({ offlineResult: s.offlineResult, clearOfflineResult: s.clearOfflineResult }))
  if (!offlineResult) return null
  const { gained, seconds, wasCapped } = offlineResult
  const entries = Object.entries(gained).filter(([, v]) => v >= 0.01)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }}>
      <div className="anim-enter" style={{ background: '#1e1428', border: '1px solid #4a0000', borderRadius: '12px', width: '360px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.8)' }}>
        <div style={{ height: '3px', background: '#8b0000' }} />
        <div style={{ padding: '18px' }}>
          <div style={{ fontFamily: 'Cinzel', fontSize: '14px', color: '#c9a227', marginBottom: '4px' }}>😴 Offline-Fortschritt</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textDim, marginBottom: '14px' }}>{fmtTime(seconds * 1000)} abwesend</div>
          {wasCapped && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#fca5a5', marginBottom: '10px' }}>⚠️ Auf max. Offline-Zeit begrenzt.</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
            {entries.map(([k, v]) => {
              const r = RES[k]; if (!r) return null
              return (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
                  <span style={{ color: C.textDim }}>{r.icon} {r.name}</span>
                  <span style={{ color: r.hex }}>+{fmt(v)}</span>
                </div>
              )
            })}
          </div>
          <Btn onClick={clearOfflineResult} variant="gold" style={{ width: '100%', justifyContent: 'center' }}>Weiter spielen</Btn>
        </div>
      </div>
    </div>
  )
}
