import { create } from 'zustand'
import type { OverlayUpdate } from '../../../shared/overlay-types'

interface OverlayState {
  wsStatus: 'connecting' | 'connected' | 'disconnected'
  wsUrl: string
  showStandings: boolean
  opacity: number
  data: OverlayUpdate | null
  setWsStatus: (status: OverlayState['wsStatus']) => void
  setWsUrl: (url: string) => void
  setShowStandings: (value: boolean) => void
  setOpacity: (value: number) => void
  setData: (update: OverlayUpdate) => void
}

export const useOverlayStore = create<OverlayState>((set) => ({
  wsStatus: 'connecting',
  wsUrl: 'ws://localhost:5000/ws',
  showStandings: true,
  opacity: 90,
  data: null,
  setWsStatus: (wsStatus) => set({ wsStatus }),
  setWsUrl: (wsUrl) => set({ wsUrl }),
  setShowStandings: (showStandings) => set({ showStandings }),
  setOpacity: (opacity) => set({ opacity }),
  setData: (data) => set({ data })
}))
