import { useEffect } from 'react'
import { connectOverlaySocket } from './services/websocket'
import { useOverlayStore } from './store/useOverlayStore'

function App() {
  const {
    data,
    wsStatus,
    wsUrl,
    showStandings,
    opacity,
    setWsUrl,
    setShowStandings,
    setOpacity
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <h1 className="text-2xl font-bold mb-4">iRacing Overlay Studio</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
          <label className="block text-sm">
            Overlay opacity ({opacity}%)
            <input
              type="range"
              min={20}
              max={100}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <p className="mt-3 text-xs">Connection: {wsStatus}</p>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="font-semibold mb-3">Live Preview</h2>
          <div
            className="rounded border border-slate-700 p-3 bg-slate-800"
            style={{ opacity: opacity / 100 }}
          >
            <p className="text-sm mb-1">Track: {data?.session.trackName ?? '-'}</p>
            <p className="text-sm mb-1">Session: {data?.session.sessionType ?? '-'}</p>
            <p className="text-sm mb-1">Lap: {data?.session.currentLap ?? 0}</p>
            <p className="text-sm mb-1">Speed: {data?.telemetry.speedKph ?? 0} km/h</p>
            <p className="text-sm">Fuel: {data?.telemetry.fuelLiters ?? 0} L</p>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="font-semibold mb-3">Widget Editor</h2>
          {showStandings ? (
            <ul className="space-y-2 text-sm">
              {(data?.standings ?? []).slice(0, 5).map((row) => (
                <li key={`${row.position}-${row.carNumber}`} className="rounded bg-slate-800 px-2 py-1">
                  {`#${row.position} ${row.driverName} (${row.carNumber}) +${row.gapToLeader.toFixed(1)}`}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Standings widget disabled.</p>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
