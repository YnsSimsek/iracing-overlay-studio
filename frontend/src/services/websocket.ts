import type { OverlayUpdate } from '../../../shared/overlay-types'

type SocketHandlers = {
  onOpen: () => void
  onClose: () => void
  onData: (payload: OverlayUpdate) => void
}

export const connectOverlaySocket = (url: string, handlers: SocketHandlers) => {
  const socket = new WebSocket(url)

  socket.onopen = handlers.onOpen
  socket.onclose = handlers.onClose
  socket.onerror = handlers.onClose
  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data) as OverlayUpdate
      handlers.onData(payload)
    } catch {
      // Ignore invalid payloads from server.
    }
  }

  return socket
}
