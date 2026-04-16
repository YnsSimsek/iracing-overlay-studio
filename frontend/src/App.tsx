import { useEffect } from 'react'
import { StandingsWidget } from './components/StandingsWidget'
import { loadProfile, saveProfile, listProfiles } from './services/configProfiles'
import { connectOverlaySocket } from './services/websocket'
import type { WidgetSizePreset } from './store/useOverlayStore'
import { useOverlayStore } from './store/useOverlayStore'

const sizePresets: Record<WidgetSizePreset, { fontSize: number; rowHeight: number }> = {
  XS: { fontSize: 11, rowHeight: 24 },
  S: { fontSize: 12, rowHeight: 28 },
  M: { fontSize: 13, rowHeight: 32 },
  L: { fontSize: 15, rowHeight: 36 }
}

const formatClock = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function App() {
  const {
    data,
    wsStatus,
    wsUrl,
    showStandings,
    profileName,
    profiles,
    settings,
    setWsUrl,
    setShowStandings,
    setProfiles,
    setProfileName,
    patchSettings,
    setColumnVisibility
  } = useOverlayStore()

  useEffect(() => {
    let isCurrent = true
    useOverlayStore.getState().setWsStatus('connecting')
    const socket = connectOverlaySocket(wsUrl, {
      onOpen: () => {
        if (isCurrent) useOverlayStore.getState().setWsStatus('connected')
      },
      onClose: () => {
        if (isCurrent) useOverlayStore.getState().setWsStatus('disconnected')
      },
      onData: (payload) => {
        if (isCurrent) useOverlayStore.getState().setData(payload)
      }
    })
    return () => {
      isCurrent = false
      socket.close()
    }
  }, [wsUrl])

  useEffect(() => {
    listProfiles(wsUrl)
      .then(setProfiles)
      .catch(() => setProfiles([]))
  }, [wsUrl, setProfiles])

  const handleSizePreset = (sizePreset: WidgetSizePreset) => {
    patchSettings({
      sizePreset,
      ...sizePresets[sizePreset]
    })
  }

  const saveActiveProfile = async () => {
    await saveProfile(wsUrl, profileName, settings)
    const nextProfiles = await listProfiles(wsUrl)
    setProfiles(nextProfiles)
  }

  const loadActiveProfile = async () => {
    const loadedSettings = await loadProfile(wsUrl, profileName)
    patchSettings(loadedSettings)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-cyan-100">iRacing Overlay Studio - Standings</h1>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="font-semibold mb-3">Settings Panel</h2>
          <label className="block text-sm mb-2">
            WebSocket URL
            <input
              className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-2 py-1"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm mb-2">
            <input
              type="checkbox"
              checked={showStandings}
              onChange={(e) => setShowStandings(e.target.checked)}
            />
            Show standings widget
          </label>
          <label className="block text-sm mb-2">
            Background opacity ({settings.opacity}%)
            <input
              type="range"
              min={0}
              max={100}
              value={settings.opacity}
              onChange={(e) => patchSettings({ opacity: Number(e.target.value) })}
              className="w-full"
            />
          </label>
          <label className="block text-sm mb-2">
            Size preset
            <select
              className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-2 py-1"
              value={settings.sizePreset}
              onChange={(e) => handleSizePreset(e.target.value as WidgetSizePreset)}
            >
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
            </select>
          </label>
          <label className="block text-sm mb-2">
            Font size ({settings.fontSize}px)
            <input
              type="range"
              min={10}
              max={20}
              value={settings.fontSize}
              onChange={(e) => patchSettings({ fontSize: Number(e.target.value) })}
              className="w-full"
            />
          </label>
          <label className="block text-sm mb-2">
            Row spacing ({settings.rowHeight}px)
            <input
              type="range"
              min={22}
              max={44}
              value={settings.rowHeight}
              onChange={(e) => patchSettings({ rowHeight: Number(e.target.value) })}
              className="w-full"
            />
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <label className="text-sm">
              X ({settings.positionX})
              <input
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-2 py-1"
                type="number"
                value={settings.positionX}
                onChange={(e) => patchSettings({ positionX: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm">
              Y ({settings.positionY})
              <input
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-2 py-1"
                type="number"
                value={settings.positionY}
                onChange={(e) => patchSettings({ positionY: Number(e.target.value) })}
              />
            </label>
          </div>
          <p className="mt-3 text-xs">Connection: {wsStatus}</p>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="font-semibold mb-3">Column Visibility</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {(Object.keys(settings.columns) as Array<keyof typeof settings.columns>).map((column) => (
              <label key={column} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.columns[column]}
                  onChange={(e) => setColumnVisibility(column, e.target.checked)}
                />
                {column}
              </label>
            ))}
          </div>

          <h2 className="font-semibold mt-5 mb-2">Profile Storage (JSON)</h2>
          <label className="block text-sm mb-2">
            Profile Name
            <input
              className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-2 py-1"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              className="rounded bg-cyan-700 hover:bg-cyan-600 px-3 py-1 text-sm"
              onClick={() => {
                void saveActiveProfile()
              }}
            >
              Save Profile
            </button>
            <button
              className="rounded bg-slate-700 hover:bg-slate-600 px-3 py-1 text-sm"
              onClick={() => {
                void loadActiveProfile()
              }}
            >
              Load Profile
            </button>
          </div>
          <p className="text-xs text-slate-400">{profiles.length > 0 ? `Available: ${profiles.join(', ')}` : 'No saved profiles.'}</p>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="font-semibold mb-3">Live Standings Preview</h2>
          <div className="mb-2 text-xs text-slate-300">
            <div>
              {data?.session.sessionType ?? '-'} | {data?.session.trackName ?? '-'} | Time Left:{' '}
              {formatClock(data?.session.remainingTimeSeconds ?? 0)}
            </div>
            <div>
              Lap {data?.session.currentLap ?? 0} / {data?.session.sessionLaps ?? 0}
            </div>
          </div>
          {showStandings ? (
            <StandingsWidget
              standings={data?.standings ?? []}
              changedDriverIds={data?.changedDriverIds ?? []}
              settings={settings}
            />
          ) : (
            <p className="text-sm text-slate-400">Standings widget disabled.</p>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
