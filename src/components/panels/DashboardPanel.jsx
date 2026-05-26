import { useGameStore } from '../../store/gameStore'
import { GrimPanel, PanelHeader, ProgressBar, StatCard, GrimDivider } from '../ui'
import { RESOURCES } from '../../utils/constants'
import { fmt, fmtPlayTime } from '../../utils/helpers'
import { calcProductionRates } from '../../systems/production'

// Pixel art skull decoration (SVG)
function PixelSkull({ size = 32, color = '#4a0000' }) {
  // 8x8 pixel skull pattern
  const pixels = [
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,1,0,1,1,0,1,0],
    [0,1,1,0,0,1,1,0],
    [0,0,0,0,0,0,0,0],
  ]
  const px = size / 8
  return (
    <svg width={size} height={size} style={{ imageRendering: 'pixelated', opacity: 0.6 }}>
      {pixels.flatMap((row, y) => row.map((v, x) =>
        v ? <rect key={`${x}-${y}`} x={x*px} y={y*px} width={px} height={px} fill={color} /> : null
      ))}
    </svg>
  )
}

// Pixel art rune decoration
function PixelRune({ size = 24, color = '#4a1a6a' }) {
  const pixels = [
    [0,0,1,0,0],
    [0,1,1,1,0],
    [1,0,1,0,1],
    [0,1,1,1,0],
    [0,0,1,0,0],
  ]
  const px = size / 5
  return (
    <svg width={size} height={size} style={{ imageRendering: 'pixelated', opacity: 0.5 }}>
      {pixels.flatMap((row, y) => row.map((v, x) =>
        v ? <rect key={`${x}-${y}`} x={x*px} y={y*px} width={px} height={px} fill={color} /> : null
      ))}
    </svg>
  )
}

// Animated soul count display
function SoulCounter({ value }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '20px',
      background: 'radial-gradient(ellipse at center, rgba(74,0,0,0.2) 0%, transparent 70%)',
      borderRadius: '12px',
      border: '1px solid rgba(74,0,0,0.3)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative pixel skulls */}
      <div style={{ position: 'absolute', top: 8, left: 8, opacity: 0.4 }}>
        <PixelSkull size={20} />
      </div>
      <div style={{ position: 'absolute', top: 8, right: 8, opacity: 0.4 }}>
        <PixelSkull size={20} />
      </div>

      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#4a0000', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>
        Seelen im Ledger
      </div>
      <div style={{ fontFamily: 'Cinzel', fontSize: '36px', color: '#8b0000', fontWeight: 700, lineHeight: 1, textShadow: '0 0 20px rgba(139,0,0,0.5)' }}>
        {fmt(value)}
      </div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#2a2028', marginTop: '4px' }}>
        💀 SEELEN
      </div>
    </div>
  )
}

export default function DashboardPanel() {
  const state = useGameStore((s) => s)
  const { resources, player, stats, prestige, quests, bossFight } = state
  const rates = calcProductionRates(state)

  const xpPct = Math.min(100, (player.xp / player.xpToNext) * 100)
  const questsDone  = [...(quests.daily || []), ...(quests.milestones || [])].filter((q) => q.claimed).length
  const questsTotal = (quests.daily?.length || 0) + (quests.milestones?.length || 0)

  const keyResources = [
    { key: 'seelen',       skip: true },  // shown separately
    { key: 'knochen' },
    { key: 'blut' },
    { key: 'schatten' },
    { key: 'erinnerungen' },
    { key: 'asche' },
    { key: 'wissen' },
    { key: 'albtraeume' },
  ]

  return (
    <GrimPanel>
      <PanelHeader icon="📖" title="Das Grim Ledger" subtitle="Verfluchtes Archiv der verlorenen Seelen" />
      <div className="grimPanel-body">

        {/* Soul counter — hero element */}
        <SoulCounter value={resources.seelen ?? 0} />

        {/* XP bar */}
        <div style={{ padding: '10px', background: 'rgba(10,8,10,0.7)', borderRadius: '8px', border: '1px solid rgba(42,32,40,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ fontFamily: 'Cinzel', fontSize: '12px', color: '#c9a227' }}>
              Archivar — Stufe {player.level}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#4a4048' }}>
              {fmt(player.xp)} / {fmt(player.xpToNext)} XP
            </div>
          </div>
          <ProgressBar value={player.xp} max={player.xpToNext} colorClass="bg-red-800" />
        </div>

        {/* Other resources grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {keyResources.filter(r => !r.skip).map(({ key }) => {
            const def  = RESOURCES[key]
            const val  = resources[key] ?? 0
            const rate = rates[key] ?? 0
            if (val < 0.01 && rate < 0.001) return null
            return (
              <div key={key} className="statCard" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{def.icon}</span>
                <div>
                  <div className="statLabel">{def.name}</div>
                  <div className="statValue" style={{ color: '#c8b89a' }}>{fmt(val)}</div>
                  {rate > 0.001 && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#2a2028' }}>{rate.toFixed(2)}/s</div>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Rare resources */}
        {(resources.leereFragmente > 0 || resources.gottloseEssenz > 0 || resources.abyssMarken > 0) && (
          <>
            <div className="grimDivider" />
            <div className="sectionLabel">✦ Seltene Ressourcen</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {['leereFragmente','gottloseEssenz','abyssMarken'].map((k) => {
                const def = RESOURCES[k]
                const val = resources[k] ?? 0
                if (val < 0.01) return null
                return (
                  <div key={k} className="statCard" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', marginBottom: '2px' }}>{def.icon}</div>
                    <div className="statValue" style={{ color: '#c9a227' }}>{fmt(val)}</div>
                    <div className="statLabel" style={{ fontSize: '10px' }}>{def.name}</div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <div className="grimDivider" />

        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div className="statCard" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>⬡</div>
            <div className="statValue" style={{ color: '#c9a227' }}>{prestige.count}</div>
            <div className="statLabel">Aufstieg</div>
          </div>
          <div className="statCard" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>🎯</div>
            <div className="statValue" style={{ color: '#4ade80' }}>{questsDone}/{questsTotal}</div>
            <div className="statLabel">Quests</div>
          </div>
          <div className="statCard" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>⏱️</div>
            <div className="statValue" style={{ color: '#6b5f6a' }}>{fmtPlayTime(stats.totalPlayTime)}</div>
            <div className="statLabel">Spielzeit</div>
          </div>
        </div>

        {/* Active boss fight */}
        {bossFight && (
          <>
            <div className="grimDivider" />
            <div style={{ padding: '10px', background: 'rgba(74,0,0,0.15)', borderRadius: '8px', border: '1px solid rgba(139,0,0,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{bossFight.bossIcon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Cinzel', fontSize: '12px', color: '#ff6b6b' }}>{bossFight.bossName}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#4a4048' }}>
                    {fmt(bossFight.currentHp)} / {fmt(bossFight.maxHp)} LP
                  </div>
                </div>
              </div>
              <ProgressBar value={bossFight.currentHp} max={bossFight.maxHp} colorClass="bg-red-800" />
            </div>
          </>
        )}

        {/* Pixel art decorative footer */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', paddingTop: '4px', opacity: 0.4 }}>
          <PixelRune size={20} />
          <PixelSkull size={20} color="#4a0000" />
          <PixelRune size={20} />
        </div>

      </div>
    </GrimPanel>
  )
}
