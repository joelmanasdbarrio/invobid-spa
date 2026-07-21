import { Spinner } from '@/components/ui/spinner'
import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

// Worker must be configured in the same module that renders Document/Page.
// Setting it in main.tsx silently fails with Vite lazy imports.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const LOADING_CONTENT = (
  <div className='flex justify-center p-4'><Spinner /></div>
)

interface PdfPreviewProps {
  blobUrl: string
}

export function PdfPreview ({ blobUrl }: PdfPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | undefined>(undefined)
  const [numPages, setNumPages] = useState(0)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setWidth(el.clientWidth)
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (loadError) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 p-4 text-sm text-muted-foreground text-center'>
        <span>No se pudo previsualizar el documento.</span>
        <a
          href={blobUrl}
          target='_blank'
          rel='noreferrer'
          className='underline text-primary'
        >
          Abrir en nueva pestaña
        </a>
      </div>
    )
  }

  return (
    <div ref={containerRef} className='w-full overflow-y-auto max-h-[75vh]'>
      <Document
        file={blobUrl}
        loading={LOADING_CONTENT}
        onLoadError={() => setLoadError(true)}
        onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
      >
        <div className='flex flex-col gap-2'>
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => (
            <Page
              key={pageNumber}
              pageNumber={pageNumber}
              width={width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={LOADING_CONTENT}
            />
          ))}
        </div>
      </Document>
    </div>
  )
}
