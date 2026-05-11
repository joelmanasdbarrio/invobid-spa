import fetchApi, { downloadFile } from '@/lib/fetchApi.ts'
import { type Document } from '@/types/Document'
import { type PaginatedResponse } from '@/types/Response'

const base_url = import.meta.env.VITE_BASE_URL

export const getDocuments = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi<PaginatedResponse<Document[]>>(`${base_url}/documents?${queryString}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar los documentos'
  })
}

export const downloadDocument = async (documentId: string, filename: string) => {
  return downloadFile(
    `${base_url}/documents/${documentId}/download`,
    filename,
    {
      promise: 'Descargando documento...',
      resolve: 'Documento descargado con éxito',
      reject: 'Error al descargar el documento'
    }
  )
}

export const previewDocument = async (documentId: string): Promise<string> => {
  const response = await fetch(`${base_url}/documents/${documentId}/preview`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error(`Failed to load document preview: ${response.status}`)
  }

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}
