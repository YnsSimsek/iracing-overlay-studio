import { Layers, SlidersHorizontal, Wifi, Columns2, Save, FolderOpen } from 'lucide-react'
import type { StandingsWidgetSettings, WidgetSizePreset } from '../store/useOverlayStore'

type Props = {
  wsUrl: string
  wsStatus: string
  showStandings: boolean
  settings: StandingsWidgetSettings
  profileName: string
  profiles: string[]
  onWsUrlChange: (value: string) => void
  onShowStandingsChange: (value: boolean) => void
  onOpacityChange: (value: number) => void
  onSizePresetChange: (value: WidgetSizePreset) => void
  onFontSizeChange: (value: number) => void
  onRowHeightChange: (value: number) => void
  onPositionChange: (x: number, y: number) => void
  onColumnVisibilityChange: (column: keyof StandingsWidgetSettings['columns'], value: boolean) => void
  onProfileNameChange: (value: string) => void
  onSaveProfile: () => void
  onLoadProfile: () => void
}

const sizePresets: WidgetSizePreset[] = ['XS', 'S', 'M', 'L']

const cardClass =
  'rounded-xl border border-yuka-border/80 bg-yuka-bgSecondary/65 backdrop-blur-yuka shadow-yuka transition duration-250 ease-out'

export const EditorPanel = ({
  wsUrl,
  wsStatus,
  showStandings,
  settings,
  profileName,
  profiles,
  onWsUrlChange,
  onShowStandingsChange,
  onOpacityChange,
  onSizePresetChange,
  onFontSizeChange,
  onRowHeightChange,
  onPositionChange,
  onColumnVisibilityChange,
  onProfileNameChange,
  onSaveProfile,
  onLoadProfile
}: Props) => {
  return (
    <aside className="w-full xl:w-[280px] flex-shrink-0 space-y-3">
      <section className={`${cardClass} p-3`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-[0.5px] text-yuka-text">
            <SlidersHorizontal size={16} className="text-yuka-cyan" /> Editor Panel
          </h2>
          <span className="flex items-center gap-1 rounded-md border border-yuka-border px-2 py-1 text-[10px] text-yuka-textSecondary">
            <Wifi size={12} className={wsStatus === 'connected' ? 'text-emerald-400' : 'text-yuka-accent'} /> {wsStatus}
          </span>
        </div>

        <label className="mb-3 block text-xs text-yuka-textSecondary">
          WebSocket URL
          <input
            className="mt-1 w-full rounded-lg border border-yuka-border bg-yuka-bg/80 px-3 py-2 text-xs text-yuka-text outline-none transition duration-250 focus:border-yuka-cyan"
            value={wsUrl}
            onChange={(e) => onWsUrlChange(e.target.value)}
          />
        </label>

        <label className="mb-2 flex cursor-pointer items-center justify-between rounded-lg border border-yuka-border px-3 py-2 text-xs text-yuka-textSecondary hover:bg-white/5">
          Standings widget
          <button
            type="button"
            onClick={() => onShowStandingsChange(!showStandings)}
            className={`relative h-5 w-10 rounded-full transition duration-250 ${showStandings ? 'bg-yuka-cyan' : 'bg-yuka-border'}`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition duration-250 ${showStandings ? 'left-5' : 'left-0.5'}`}
            />
          </button>
        </label>
      </section>

      <details open className={cardClass}>
        <summary className="cursor-pointer list-none px-3 py-2 text-sm font-bold tracking-[0.5px] text-yuka-text">Display</summary>
        <div className="space-y-3 px-3 pb-3 text-xs text-yuka-textSecondary">
          <label className="block">
            Opacity ({settings.opacity}%)
            <input
              type="range"
              min={0}
              max={100}
              value={settings.opacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              className="mt-1 w-full accent-yuka-cyan"
            />
          </label>
          <div>
            <p className="mb-1">Size preset</p>
            <div className="grid grid-cols-4 gap-2">
              {sizePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`rounded-lg border px-2 py-1 transition duration-250 hover:scale-[1.02] ${
                    settings.sizePreset === preset
                      ? 'border-yuka-accent bg-yuka-accent/20 text-yuka-text'
                      : 'border-yuka-border bg-yuka-bg/70 text-yuka-textSecondary'
                  }`}
                  onClick={() => onSizePresetChange(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label>
              Font ({settings.fontSize}px)
              <input
                type="range"
                min={10}
                max={20}
                value={settings.fontSize}
                onChange={(e) => onFontSizeChange(Number(e.target.value))}
                className="mt-1 w-full accent-yuka-cyan"
              />
            </label>
            <label>
              Row ({settings.rowHeight}px)
              <input
                type="range"
                min={22}
                max={44}
                value={settings.rowHeight}
                onChange={(e) => onRowHeightChange(Number(e.target.value))}
                className="mt-1 w-full accent-yuka-cyan"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label>
              X
              <input
                type="number"
                value={settings.positionX}
                onChange={(e) => onPositionChange(Number(e.target.value), settings.positionY)}
                className="mt-1 w-full rounded-lg border border-yuka-border bg-yuka-bg/80 px-2 py-1 text-yuka-text"
              />
            </label>
            <label>
              Y
              <input
                type="number"
                value={settings.positionY}
                onChange={(e) => onPositionChange(settings.positionX, Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-yuka-border bg-yuka-bg/80 px-2 py-1 text-yuka-text"
              />
            </label>
          </div>
        </div>
      </details>

      <details open className={cardClass}>
        <summary className="cursor-pointer list-none px-3 py-2 text-sm font-bold tracking-[0.5px] text-yuka-text">
          <span className="inline-flex items-center gap-2">
            <Columns2 size={16} className="text-yuka-cyan" /> Columns
          </span>
        </summary>
        <div className="grid grid-cols-2 gap-2 px-3 pb-3 text-xs">
          {(Object.keys(settings.columns) as Array<keyof typeof settings.columns>).map((column) => (
            <label key={column} className="flex items-center gap-2 rounded-lg border border-yuka-border px-2 py-1 text-yuka-textSecondary">
              <input
                type="checkbox"
                checked={settings.columns[column]}
                onChange={(e) => onColumnVisibilityChange(column, e.target.checked)}
                className="accent-yuka-cyan"
              />
              {column}
            </label>
          ))}
        </div>
      </details>

      <section className={`${cardClass} p-3`}>
        <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-bold tracking-[0.5px] text-yuka-text">
          <Layers size={16} className="text-yuka-cyan" /> Profiles
        </h3>
        <input
          className="mb-2 w-full rounded-lg border border-yuka-border bg-yuka-bg/80 px-3 py-2 text-xs text-yuka-text"
          value={profileName}
          onChange={(e) => onProfileNameChange(e.target.value)}
        />
        <div className="mb-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSaveProfile}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-yuka-accent bg-yuka-accent/20 px-2 py-2 text-xs text-yuka-text transition duration-250 hover:brightness-110"
          >
            <Save size={14} /> Save
          </button>
          <button
            type="button"
            onClick={onLoadProfile}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-yuka-border bg-yuka-bg/90 px-2 py-2 text-xs text-yuka-textSecondary transition duration-250 hover:text-yuka-text"
          >
            <FolderOpen size={14} /> Load
          </button>
        </div>
        <p className="text-[11px] text-yuka-textTertiary">{profiles.length > 0 ? `Available: ${profiles.join(', ')}` : 'No saved profiles.'}</p>
      </section>
    </aside>
  )
}
