import type { DriverStandings } from '../../../shared/overlay-types'
import type { StandingsWidgetSettings } from '../store/useOverlayStore'

type Props = {
  standings: DriverStandings[]
  changedDriverIds: number[]
  settings: StandingsWidgetSettings
}

const formatTime = (value: number) => {
  if (!value || value <= 0) return '--.--'
  return value.toFixed(3)
}

const formatGap = (value: number) => {
  if (!value || value <= 0) return 'LEADER'
  return `+${value.toFixed(3)}`
}

const countryFlag = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))

const positionDeltaClass = (delta: number) => {
  if (delta > 0) return 'text-emerald-400'
  if (delta < 0) return 'text-rose-400'
  return 'text-slate-400'
}

const positionDeltaSymbol = (delta: number) => {
  if (delta > 0) return `↑${delta}`
  if (delta < 0) return `↓${Math.abs(delta)}`
  return '→0'
}

export const StandingsWidget = ({ standings, changedDriverIds, settings }: Props) => {
  return (
    <div
      className="rounded-lg border border-cyan-500/35 bg-slate-950/95 shadow-[0_0_35px_rgba(34,211,238,0.15)] overflow-hidden"
      style={{
        opacity: settings.opacity / 100,
        fontSize: `${settings.fontSize}px`,
        transform: `translate(${settings.positionX}px, ${settings.positionY}px)`
      }}
    >
      <table className="w-full border-collapse">
        <thead className="bg-slate-900/90 text-cyan-200 uppercase tracking-[0.12em] text-[0.72em]">
          <tr>
            {settings.columns.position && <th className="px-2 py-2 text-left">Pos</th>}
            {settings.columns.positionChange && <th className="px-2 py-2 text-left">Δ</th>}
            {settings.columns.carNumber && <th className="px-2 py-2 text-left">#</th>}
            {settings.columns.countryFlag && <th className="px-2 py-2 text-left">Flag</th>}
            {settings.columns.driverName && <th className="px-2 py-2 text-left">Driver</th>}
            {settings.columns.gap && <th className="px-2 py-2 text-left">Gap</th>}
            {settings.columns.interval && <th className="px-2 py-2 text-left">Int</th>}
            {settings.columns.bestTime && <th className="px-2 py-2 text-left">Best</th>}
            {settings.columns.lastTime && <th className="px-2 py-2 text-left">Last</th>}
            {settings.columns.pitStatus && <th className="px-2 py-2 text-left">Pit</th>}
            {settings.columns.currentLap && <th className="px-2 py-2 text-left">Lap</th>}
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => (
            <tr
              key={row.driverId}
              className={`border-t border-slate-900 transition-all duration-200 ${
                row.isCurrentPlayer ? 'bg-cyan-500/10 text-cyan-100' : 'bg-slate-900/65'
              } ${changedDriverIds.includes(row.driverId) ? 'animate-pulse' : ''}`}
              style={{ height: `${settings.rowHeight}px` }}
            >
              {settings.columns.position && <td className="px-2 font-semibold">{row.position}</td>}
              {settings.columns.positionChange && (
                <td className={`px-2 font-semibold ${positionDeltaClass(row.positionChange)}`}>
                  {positionDeltaSymbol(row.positionChange)}
                </td>
              )}
              {settings.columns.carNumber && <td className="px-2">#{row.driver.carNumber}</td>}
              {settings.columns.countryFlag && <td className="px-2">{countryFlag(row.driver.countryCode)}</td>}
              {settings.columns.driverName && <td className="px-2">{row.driver.name}</td>}
              {settings.columns.gap && <td className="px-2">{formatGap(row.gapToLeader)}</td>}
              {settings.columns.interval && <td className="px-2">{row.position === 1 ? '-' : `+${row.intervalToNext.toFixed(3)}`}</td>}
              {settings.columns.bestTime && <td className="px-2">{formatTime(row.bestLapTime)}</td>}
              {settings.columns.lastTime && <td className="px-2">{formatTime(row.lastLapTime)}</td>}
              {settings.columns.pitStatus && <td className="px-2">{row.pitStatus}</td>}
              {settings.columns.currentLap && <td className="px-2">{row.currentLap}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
