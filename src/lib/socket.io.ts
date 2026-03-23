import { io, type Socket } from 'socket.io-client'
import { toast } from 'sonner'

export function connectSocketIO (namespace: string = ''): Socket {
  const socketUrl = import.meta.env.VITE_SOCKET_URL
  const connectionUrl = `${socketUrl}${namespace}`

  return io(connectionUrl, {
    withCredentials: true
  })
}

export function socketEmit (
  socket: Socket,
  event: string,
  payload: unknown,
  notification?: {
    reject?: string
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (res: { success: boolean; message?: string }) => {
      if (!res.success) {
        if (notification?.reject) {
          toast.error(`${notification.reject}: ${res.message}`)
        }
        reject(new Error(res.message))
      } else {
        resolve()
      }
    })
  })
}
