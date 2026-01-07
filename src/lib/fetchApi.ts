import {toast} from 'sonner'

export async function downloadFile (
  url: string,
  filename: string,
  notification?: {
    promise?: string,
    resolve?: string,
    reject?: string
  }
) {
  const downloadRequest = async () => {
    const response = await fetch(url, {
      credentials: 'include',
      method: 'GET'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Download failed')
    }

    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(blobUrl)

    return { success: true }
  }

  if (!notification) {
    return downloadRequest()
  }

  const { promise, resolve, reject } = notification
  const downloadPromise = downloadRequest()

  toast.promise(
    downloadPromise,
    {
      loading: promise,
      success: resolve,
      error: (error) => `${reject}: ${error.message}`
    }
  )

  return downloadPromise
}

export default function fetchApi<T = Record<string, unknown>> (
  url: string,
  options: RequestInit,
  notification?: {
    promise?: string,
    resolve?: string,
    reject?: string
  },
  onResolve?: (response: T) => void,
  onReject?: (error: Error) => void
) {
  const fetchRequest = async () => {
    const response = await fetch(url, {
      credentials: 'include',
      ...options
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw errorData
    }
    return response.json()
  }

  if (!notification) {
    return fetchRequest()
  }

  const { promise, resolve, reject } = notification
  const dataPromise = fetchRequest()

  toast.promise<T>(
    dataPromise,
    {
      loading: promise,
      success: resolve && ((data) => {
        if (onResolve) onResolve(data)
        return resolve || undefined
      }),
      error: reject && ((error) => {
        if (onReject) onReject(error)
        return `${reject}: ${error.message}`
      })
    }
  )

  return dataPromise
}
