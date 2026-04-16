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
  return 'text-yuka-textTertiary'
}

const positionDeltaSymbol = (delta: number) => {
  if (delta > 0) return `↑${delta}`
  if (delta < 0) return `↓${Math.abs(delta)}`
  return '→0'
}

const pitStatusClass = (pitStatus: string) => {
  if (pitStatus.toLowerCase() === 'pit') return 'text-amber-300'
  if (pitStatus.toLowerCase() === 'dnf') return 'text-rose-400'
  return 'text-yuka-textSecondary'
}

export const StandingsWidget = ({ standings, changedDriverIds, settings }: Props) => {
  return (
    <div
      className="overflow-hidden rounded-xl border border-yuka-border bg-yuka-bgSecondary shadow-yuka backdrop-blur-yuka transition duration-250"
      style={{
        opacity: settings.opacity / 100,
        fontSize: `${settings.fontSize}px`,
        backgroundColor: 'rgba(15, 18, 41, 0.75)'
      }}
    >
      <table className="w-full border-collapse">
        <thead className="bg-white/5 text-yuka-textSecondary uppercase tracking-[0.5px] text-[0.72em]">
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
            {settings.columns.pitStatus && <th className="px-2 py-2 text-left">Status</th>}
            {settings.columns.currentLap && <th className="px-2 py-2 text-left">Lap</th>}
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => (
            <tr
              key={row.driverId}
              className={`border-t border-yuka-border transition duration-250 hover:bg-white/5 ${
                row.isCurrentPlayer ? 'bg-yuka-accent/10 ring-1 ring-inset ring-yuka-accent/70' : 'bg-transparent'
              } ${changedDriverIds.includes(row.driverId) ? 'animate-pulse' : ''}`}
              style={{ height: `${settings.rowHeight}px` }}
            >
              {settings.columns.position && (
                <td className="px-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-yuka-cyan/60 bg-yuka-bg text-[0.88em] font-semibold text-yuka-text">
                    {row.position}
                  </span>
                </td>
              )}
              {settings.columns.positionChange && (
                <td className={`px-2 font-semibold ${positionDeltaClass(row.positionChange)}`}>
                  {positionDeltaSymbol(row.positionChange)}
                </td>
              )}
              {settings.columns.carNumber && <td className="px-2 text-yuka-textSecondary">#{row.driver.carNumber}</td>}
              {settings.columns.countryFlag && <td className="px-2">{countryFlag(row.driver.countryCode)}</td>}
              {settings.columns.driverName && <td className="px-2 text-yuka-text">{row.driver.name}</td>}
              {settings.columns.gap && <td className="px-2 font-mono text-emerald-300">{formatGap(row.gapToLeader)}</td>}
              {settings.columns.interval && (
                <td className={`px-2 font-mono ${row.position === 1 ? 'text-yuka-textTertiary' : 'text-rose-300'}`}>
                  {row.position === 1 ? '-' : `+${row.intervalToNext.toFixed(3)}`}
                </td>
              )}
              {settings.columns.bestTime && <td className="px-2 font-mono text-yuka-cyan">{formatTime(row.bestLapTime)}</td>}
              {settings.columns.lastTime && <td className="px-2 font-mono text-yuka-textSecondary">{formatTime(row.lastLapTime)}</td>}
              {settings.columns.pitStatus && <td className={`px-2 uppercase ${pitStatusClass(row.pitStatus)}`}>{row.pitStatus}</td>}
              {settings.columns.currentLap && <td className="px-2 text-yuka-textSecondary">{row.currentLap}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
