import { create } from 'zustand'
import type { OverlayUpdate } from '../../../shared/overlay-types'

export type WidgetSizePreset = 'XS' | 'S' | 'M' | 'L'

export interface StandingsColumnVisibility {
  position: boolean
  positionChange: boolean
  carNumber: boolean
  countryFlag: boolean
  driverName: boolean
  gap: boolean
  interval: boolean
  bestTime: boolean
  lastTime: boolean
  pitStatus: boolean
  currentLap: boolean
}

export interface StandingsWidgetSettings {
  opacity: number
  sizePreset: WidgetSizePreset
  fontSize: number
  rowHeight: number
  positionX: number
  positionY: number
  columns: StandingsColumnVisibility
}

interface OverlayState {
  wsStatus: 'connecting' | 'connected' | 'disconnected'
  wsUrl: string
  showStandings: boolean
  profileName: string
  profiles: string[]
  settings: StandingsWidgetSettings
  data: OverlayUpdate | null
  setWsStatus: (status: OverlayState['wsStatus']) => void
  setWsUrl: (url: string) => void
  setShowStandings: (value: boolean) => void
  setProfiles: (profiles: string[]) => void
  setProfileName: (name: string) => void
  patchSettings: (patch: Partial<StandingsWidgetSettings>) => void
  setColumnVisibility: (column: keyof StandingsColumnVisibility, value: boolean) => void
  setData: (update: OverlayUpdate) => void
}

const defaultSettings: StandingsWidgetSettings = {
  opacity: 90,
  sizePreset: 'M',
  fontSize: 13,
  rowHeight: 32,
  positionX: 0,
  positionY: 0,
  columns: {
    position: true,
    positionChange: true,
    carNumber: true,
    countryFlag: true,
    driverName: true,
    gap: true,
    interval: true,
    bestTime: true,
    lastTime: true,
    pitStatus: true,
    currentLap: true
  }
}

const mergeOverlayUpdate = (previous: OverlayUpdate | null, update: OverlayUpdate): OverlayUpdate => {
  if (!previous || update.isSnapshot) {
    return update
  }

  const standingsByDriver = new Map(previous.standings.map((entry) => [entry.driverId, entry]))
  for (const entry of update.standings) {
    standingsByDriver.set(entry.driverId, entry)
  }

  const telemetryByDriver = new Map(previous.driverTelemetry.map((entry) => [entry.driverId, entry]))
  for (const entry of update.driverTelemetry) {
    telemetryByDriver.set(entry.driverId, entry)
  }

  return {
    ...previous,
    ...update,
    isSnapshot: false,
    standings: Array.from(standingsByDriver.values()).sort((a, b) => a.position - b.position),
    driverTelemetry: Array.from(telemetryByDriver.values()),
    changedDriverIds: update.changedDriverIds
  }
}

export const useOverlayStore = create<OverlayState>((set) => ({
  wsStatus: 'connecting',
  wsUrl: 'ws://localhost:5000/ws',
  showStandings: true,
  profileName: 'default',
  profiles: [],
  settings: defaultSettings,
  data: null,
  setWsStatus: (wsStatus) => set({ wsStatus }),
  setWsUrl: (wsUrl) => set({ wsUrl }),
  setShowStandings: (showStandings) => set({ showStandings }),
  setProfiles: (profiles) => set({ profiles }),
  setProfileName: (profileName) => set({ profileName }),
  patchSettings: (patch) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...patch
      }
    })),
  setColumnVisibility: (column, value) =>
    set((state) => ({
      settings: {
        ...state.settings,
        columns: {
          ...state.settings.columns,
          [column]: value
        }
      }
    })),
  setData: (update) =>
    set((state) => ({
      data: mergeOverlayUpdate(state.data, update)
    }))
}))
