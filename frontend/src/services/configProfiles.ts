import type { StandingsWidgetSettings } from '../store/useOverlayStore'

const getApiBaseUrl = (wsUrl: string) => {
  try {
    const parsed = new URL(wsUrl)
    const protocol = parsed.protocol === 'wss:' ? 'https:' : 'http:'
    return `${protocol}//${parsed.host}`
  } catch {
    return 'http://localhost:5000'
  }
}

export const listProfiles = async (wsUrl: string) => {
  const response = await fetch(`${getApiBaseUrl(wsUrl)}/api/config/profiles`)
  if (!response.ok) {
    throw new Error('Failed to load profiles')
  }
  return (await response.json()) as string[]
}

export const loadProfile = async (wsUrl: string, profileName: string) => {
  const response = await fetch(`${getApiBaseUrl(wsUrl)}/api/config/profiles/${encodeURIComponent(profileName)}`)
  if (!response.ok) {
    throw new Error('Failed to load profile')
  }
  return (await response.json()) as StandingsWidgetSettings
}

export const saveProfile = async (wsUrl: string, profileName: string, settings: StandingsWidgetSettings) => {
  const response = await fetch(`${getApiBaseUrl(wsUrl)}/api/config/profiles/${encodeURIComponent(profileName)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(settings)
  })
  if (!response.ok) {
    throw new Error('Failed to save profile')
  }
}
