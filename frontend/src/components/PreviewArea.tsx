import { useMemo, useState } from 'react'
import { Grid2X2, Move, ScanLine } from 'lucide-react'
import type { OverlayUpdate } from '../../../shared/overlay-types'
import type { StandingsWidgetSettings } from '../store/useOverlayStore'
import { StandingsWidget } from './StandingsWidget'

type Props = {
  data: OverlayUpdate | null
  showStandings: boolean
  settings: StandingsWidgetSettings
  onPositionChange: (x: number, y: number) => void
}

const formatClock = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const PreviewArea = ({ data, showStandings, settings, onPositionChange }: Props) => {
  const [showGrid, setShowGrid] = useState(true)
  const [dragging, setDragging] = useState(false)

  const gridBackground = useMemo(
    () =>
      showGrid
        ? 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)'
        : undefined,
    [showGrid]
  )

  return (
    <section aria-label="Live Preview Area" className="flex-1 rounded-xl border border-yuka-accent/60 bg-yuka-bgSecondary/55 p-4 shadow-yuka backdrop-blur-yuka">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-base font-bold tracking-[0.5px] text-yuka-text">
          <ScanLine size={18} className="text-yuka-cyan" /> Live Preview
        </h2>
        <button
          type="button"
          onClick={() => setShowGrid((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-yuka-border bg-yuka-bg/70 px-3 py-1 text-xs text-yuka-textSecondary transition duration-250 hover:text-yuka-text"
        >
          <Grid2X2 size={14} /> Grid {showGrid ? 'On' : 'Off'}
        </button>
      </div>

      <div className="mb-3 text-xs text-yuka-textSecondary">
        {data?.session.sessionType ?? '-'} | {data?.session.trackName ?? '-'} | Time Left: {formatClock(data?.session.remainingTimeSeconds ?? 0)}
        <div>
          Lap {data?.session.currentLap ?? 0} / {data?.session.sessionLaps ?? 0}
        </div>
      </div>

      <div
        className="relative min-h-[520px] overflow-hidden rounded-xl border border-yuka-cyan/35 bg-yuka-bg/85 p-4"
        style={{ backgroundImage: gridBackground, backgroundSize: '20px 20px' }}
        onMouseMove={(event) => {
          if (!dragging) return
          const bounds = event.currentTarget.getBoundingClientRect()
          onPositionChange(Math.round(event.clientX - bounds.left - 40), Math.round(event.clientY - bounds.top - 20))
        }}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
      >
        <div className="absolute right-3 top-3 rounded bg-black/35 px-2 py-1 font-mono text-[11px] text-yuka-textSecondary">
          X:{settings.positionX} Y:{settings.positionY}
        </div>

        {showStandings ? (
          <div
            className={`absolute cursor-move rounded-xl border border-dashed p-1 transition duration-250 ${dragging ? 'border-yuka-accent' : 'border-transparent hover:border-yuka-cyan/50'}`}
            style={{ left: 0, top: 0, transform: `translate(${settings.positionX}px, ${settings.positionY}px)` }}
            onMouseDown={() => setDragging(true)}
          >
            <div className="pointer-events-none absolute -left-2 -top-2 rounded-full bg-yuka-accent p-1 text-white shadow-yuka">
              <Move size={12} />
            </div>
            <StandingsWidget standings={data?.standings ?? []} changedDriverIds={data?.changedDriverIds ?? []} settings={settings} />
          </div>
        ) : (
          <p className="text-sm text-yuka-textTertiary">Standings widget disabled.</p>
        )}
      </div>
    </section>
  )
}
