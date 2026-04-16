export interface TelemetryData {
  speedKph: number
  rpm: number
  gear: number
  throttle: number
  brake: number
  fuelLiters: number
}

export interface StandingEntry {
  position: number
  driverName: string
  carNumber: string
  gapToLeader: number
  lastLapTime: number
}

export interface SessionInfo {
  sessionType: string
  trackName: string
  lapsRemaining: number
  currentLap: number
  isGreenFlag: boolean
}

export interface OverlayUpdate {
  timestamp: string
  telemetry: TelemetryData
  session: SessionInfo
  standings: StandingEntry[]
}
