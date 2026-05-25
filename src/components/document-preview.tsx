import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { previewDocument } from '@/services/document.api'
import type { Document } from '@/types/Document'
import { ExternalLinkIcon, EyeIcon, FileIcon, Maximize2Icon } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const PdfPreview = lazy(() => import('@/components/ui/pdf-preview').then(m => ({ default: m.PdfPreview })))

export function DocumentPreview ({
  document,
  triggerOnly = false,
  protectedDocument = false
}: {
  document: Document;
  triggerOnly?: boolean;
  protectedDocument?: boolean
}) {
  const [blobUrl, setBlobUrl] = useState<string | undefined>()
  const [loading, setLoading] = useState(!triggerOnly)
  const [open, setOpen] = useState(false)

  const extension = document.filename.split('.').pop()?.toLowerCase() ?? ''
  const isImage = ['jpg', 'jpeg', 'png'].includes(extension)
  const isPdf = extension === 'pdf'

  useEffect(() => {
    if (triggerOnly && !open) return
    let url: string
    previewDocument(document.id)
      .then((objectUrl) => {
        url = objectUrl
        setBlobUrl(objectUrl)
      })
      .finally(() => setLoading(false))

    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [document.id, open, triggerOnly])

  function handleOpenChange (v: boolean) {
    if (v) setLoading(true)
    else setBlobUrl(undefined)
    setOpen(v)
  }

  if (triggerOnly) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant='ghost' size='icon'>
            <EyeIcon className='w-4 h-4' />
          </Button>
        </DialogTrigger>
        <PreviewDialogInner document={document} loading={loading} blobUrl={blobUrl} isImage={isImage} isPdf={isPdf} protectedDocument={protectedDocument} />
      </Dialog>
    )
  }

  return(
    <Card>
      <CardHeader className='flex items-center gap-2'>
        <span className='rounded-md p-1 bg-primary/20 text-primary'>
          <FileIcon className='w-4 h-4' />
        </span>
        <h4>Previsualización</h4>
      </CardHeader>
      <CardContent className='flex items-center justify-center'>
        <Dialog>

          <div className='border w-full  xl:aspect-square relative flex items-center justify-center'>
            <div className='absolute bg-white/50 dark:bg-black/50 xl:bg-transparent xl:dark:bg-transparent xl:hover:bg-white/50 xl:dark:hover:bg-black/50 w-full h-full md:hidden xl:flex items-center justify-center group z-10'>
              <DialogTrigger asChild>
                <Button variant='ghost' className='hover:bg-transparent size-full xl:hidden group-hover:flex items-center justify-center group' disabled={loading}>
                  <Maximize2Icon className='size-5 text-muted-foreground' />
                </Button>
              </DialogTrigger>
            </div>
            {protectedDocument
              ? (
                <ContextMenu>
                  <ContextMenuTrigger>
                    <PreviewMedia loading={loading} blobUrl={blobUrl} isImage={isImage} isPdf={isPdf} />
                  </ContextMenuTrigger>
                  <ContextMenuContent className='text-center'>
                    <span>Debido a las políticas de privacidad<br />de la plataforma, no se permite<br />la descarga directa de este documento</span>
                  </ContextMenuContent>
                </ContextMenu>
              ) : (
                <PreviewMedia loading={loading} blobUrl={blobUrl} isImage={isImage} isPdf={isPdf} />
              )}
          </div>

          <PreviewDialogInner document={document} loading={loading} blobUrl={blobUrl} isImage={isImage} isPdf={isPdf} protectedDocument={protectedDocument} />
        </Dialog>
      </CardContent>
    </Card>
  )
}

function PreviewDialogInner ({
  document,
  loading,
  blobUrl,
  isImage,
  isPdf,
  protectedDocument
}: {
  document: Document
  loading: boolean
  blobUrl: string | undefined
  isImage: boolean
  isPdf: boolean
  protectedDocument: boolean
}) {
  return (
    <DialogContent className='max-h-[calc(100vh-2rem)] max-w-[90vw] sm:max-w-[80dvw] aspect-square'>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>
          <span className='rounded-md p-1 bg-primary/20 text-primary'>
            <FileIcon className='w-4 h-4' />
          </span>
          <span>Previsualización</span>
        </DialogTitle>
        <DialogDescription>
          {document.title}
        </DialogDescription>
      </DialogHeader>
      <div className='overflow-hidden flex items-center justify-center'>
        {protectedDocument
          ? (
            <ContextMenu>
              <ContextMenuTrigger className='w-full h-full'>
                <PreviewMedia loading={loading} blobUrl={blobUrl} isImage={isImage} isPdf={isPdf} />
              </ContextMenuTrigger>
              <ContextMenuContent className='text-center'>
                <span>Debido a las políticas de privacidad<br />de la plataforma, no se permite<br />la descarga directa de este documento</span>
              </ContextMenuContent>
            </ContextMenu>
          ) : (
            <PreviewMedia loading={loading} blobUrl={blobUrl} isImage={isImage} isPdf={isPdf} />
          )}
      </div>
      {blobUrl && !protectedDocument && (
        <DialogFooter>
          <Button asChild variant='outline'>
            <a href={blobUrl} target='_blank' rel='noreferrer'>
              <ExternalLinkIcon className='size-4' />
              Abrir en nueva pestaña
            </a>
          </Button>
        </DialogFooter>
      )}
    </DialogContent>
  )
}

function PreviewMedia ({ loading, blobUrl, isImage, isPdf }: {
  loading: boolean
  blobUrl: string | undefined
  isImage: boolean
  isPdf: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!isImage || !blobUrl || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)
    }
    img.src = blobUrl
  }, [blobUrl, isImage])

  if (loading) return <Spinner />
  if (!blobUrl) return null

  if (isImage) return (
    <canvas ref={canvasRef} className='w-full h-full' />
  )
  if (isPdf) return (
    <Suspense fallback={<Spinner />}>
      <PdfPreview blobUrl={blobUrl} />
    </Suspense>
  )
  return null
}
