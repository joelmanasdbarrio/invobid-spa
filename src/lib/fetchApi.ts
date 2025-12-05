import { toast } from 'sonner'

export default function fetchApi<T = Record<string, unknown>> (
  url: string,
  options: RequestInit,
  notification?: {
    promise: string,
    resolve: string,
    reject: string
  },
  onResolve?: () => void,
  onReject?: () => void
) {
  const fetchRequest = async () => {
    const response = await fetch(url, {
      credentials: 'include',
      ...options
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Unknown error occurred')
    }
    return response.json()
  }

  if (!notification) {
    return fetchRequest()
  }

  const { promise, resolve, reject } = notification

  return toast.promise<T>(
    fetchRequest(),
    {
      loading: promise,
      success: () => {
        if (onResolve) onResolve()
        return resolve
      },
      error: (error) => {
        if (onReject) onReject()
        return `${reject}: ${error.message}`
      }
    }
  )
}
