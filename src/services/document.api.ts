import fetchApi, {downloadFile} from '@/lib/fetchApi.ts'

const base_url = import.meta.env.VITE_BASE_URL

export const getDocuments = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi(`${base_url}/documents?${queryString}`, {
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
