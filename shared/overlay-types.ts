export interface TelemetryData {
  speedKph: number
  rpm: number
  gear: number
  throttle: number
  brake: number
  fuelLiters: number
}

export interface DriverInfo {
  id: number
  name: string
  carNumber: string
  countryCode: string
  iRating: number
  team: string
}

export interface DriverTelemetry {
  driverId: number
  speedKph: number
  gear: number
  throttle: number
  brake: number
}

export interface DriverStandings {
  driverId: number
  position: number
  positionChange: number
  currentLap: number
  pitStatus: string
  gapToLeader: number
  intervalToNext: number
  bestLapTime: number
  lastLapTime: number
  driver: DriverInfo
  isCurrentPlayer: boolean
}

export interface SessionInfo {
  sessionType: string
  trackName: string
  remainingTimeSeconds: number
  sessionLaps: number
  lapsRemaining: number
  currentLap: number
  isGreenFlag: boolean
}

export interface OverlayUpdate {
  timestamp: string
  isSnapshot: boolean
  playerDriverId: number
  telemetry: TelemetryData
  driverTelemetry: DriverTelemetry[]
  session: SessionInfo
  standings: DriverStandings[]
  changedDriverIds: number[]
}
