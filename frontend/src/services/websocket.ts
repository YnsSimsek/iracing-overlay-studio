import type { OverlayUpdate } from '../../../shared/overlay-types'

type SocketHandlers = {
  onOpen: () => void
  onClose: () => void
  onData: (payload: OverlayUpdate) => void
}

export const connectOverlaySocket = (url: string, handlers: SocketHandlers) => {
  let socket: WebSocket | null = null
  let isClosedByUser = false
  let reconnectTimer: number | undefined
  let reconnectDelayMs = 500

  const connect = () => {
    socket = new WebSocket(url)

    socket.onopen = () => {
      reconnectDelayMs = 500
      handlers.onOpen()
    }

    socket.onclose = () => {
      handlers.onClose()
      if (isClosedByUser) return
      reconnectTimer = window.setTimeout(connect, reconnectDelayMs)
      reconnectDelayMs = Math.min(reconnectDelayMs * 2, 4000)
    }

    socket.onerror = () => {
      socket?.close()
    }

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as OverlayUpdate
        handlers.onData(payload)
      } catch {
        // Ignore invalid payloads from server.
      }
    }
  }

  connect()

  return {
    close: () => {
      isClosedByUser = true
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer)
      }
      socket?.close()
    }
  }
}
