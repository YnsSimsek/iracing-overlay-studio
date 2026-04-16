import { useEffect } from 'react'
import { EditorPanel } from './components/EditorPanel'
import { PreviewArea } from './components/PreviewArea'
import { listProfiles, loadProfile, saveProfile } from './services/configProfiles'
import { connectOverlaySocket } from './services/websocket'
import type { WidgetSizePreset } from './store/useOverlayStore'
import { useOverlayStore } from './store/useOverlayStore'

const sizePresets: Record<WidgetSizePreset, { fontSize: number; rowHeight: number }> = {
  XS: { fontSize: 11, rowHeight: 24 },
  S: { fontSize: 12, rowHeight: 28 },
  M: { fontSize: 13, rowHeight: 32 },
  L: { fontSize: 15, rowHeight: 36 }
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
    <main className="min-h-screen bg-yuka-bg px-4 py-5 font-sans text-yuka-text">
      <header className="mb-4 rounded-xl border border-yuka-border bg-yuka-bgSecondary/65 px-4 py-3 shadow-yuka backdrop-blur-yuka">
        <h1 className="text-xl font-bold tracking-[0.5px]">iRacing Overlay Studio</h1>
        <p className="text-sm text-yuka-textSecondary">Modern YUKA-inspired editor and live standings preview</p>
      </header>

      <div className="flex flex-col gap-4 xl:flex-row">
        <EditorPanel
          wsUrl={wsUrl}
          wsStatus={wsStatus}
          showStandings={showStandings}
          settings={settings}
          profileName={profileName}
          profiles={profiles}
          onWsUrlChange={setWsUrl}
          onShowStandingsChange={setShowStandings}
          onOpacityChange={(value) => patchSettings({ opacity: value })}
          onSizePresetChange={handleSizePreset}
          onFontSizeChange={(value) => patchSettings({ fontSize: value })}
          onRowHeightChange={(value) => patchSettings({ rowHeight: value })}
          onPositionChange={(x, y) => patchSettings({ positionX: x, positionY: y })}
          onColumnVisibilityChange={setColumnVisibility}
          onProfileNameChange={setProfileName}
          onSaveProfile={() => {
            void saveActiveProfile()
          }}
          onLoadProfile={() => {
            void loadActiveProfile()
          }}
        />
        <PreviewArea
          data={data}
          showStandings={showStandings}
          settings={settings}
          onPositionChange={(x, y) => patchSettings({ positionX: x, positionY: y })}
        />
      </div>
    </main>
  )
}

export default App
