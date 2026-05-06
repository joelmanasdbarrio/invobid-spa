import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { previewDocument } from '@/services/document.api'
import type { Document } from '@/types/Document'
import { ExternalLinkIcon, EyeIcon, FileIcon, Maximize2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'

function PreviewDialogInner ({
  document,
  loading,
  blobUrl,
  isImage,
  isPdf
}: {
  document: Document
  loading: boolean
  blobUrl: string | undefined
  isImage: boolean
  isPdf: boolean
}) {
  return (
    <>
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
      <div className='aspect-square flex items-center justify-center'>
        {loading && <Spinner />}
        {!loading && blobUrl && isImage && (
          <AspectRatio ratio={ 1 / 1 }>
            <img src={blobUrl} alt={document.title} className='w-full h-full object-contain' />
          </AspectRatio>
        )}
        {!loading && blobUrl && isPdf && (
          <embed
            src={`${blobUrl}#page=1&toolbar=0&navpanes=0`}
            type='application/pdf'
            className='w-full h-full'
          />
        )}
      </div>
      {blobUrl && (
        <DialogFooter>
          <Button asChild variant='outline'>
            <a href={blobUrl} target='_blank' rel='noreferrer'>
              <ExternalLinkIcon className='size-4' />
              Abrir en nueva pestaña
            </a>
          </Button>
        </DialogFooter>
      )}
    </>
  )
}

export function DocumentPreview ({ document, triggerOnly = false }: { document: Document; triggerOnly?: boolean }) {
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
        <DialogContent>
          <PreviewDialogInner document={document} loading={loading} blobUrl={blobUrl} isImage={isImage} isPdf={isPdf} />
        </DialogContent>
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
            <div className='absolute bg-white/50 dark:bg-black/50 xl:bg-transparent xl:dark:bg-transparent xl:hover:bg-white/50 xl:dark:hover:bg-black/50 w-full h-full flex items-center justify-center group z-10'>
              <DialogTrigger asChild>
                <Button variant='ghost' className='hover:bg-transparent size-full xl:hidden group-hover:flex items-center justify-center group' disabled={loading}>
                  <Maximize2Icon className='size-5 text-muted-foreground' />
                </Button>
              </DialogTrigger>
            </div>
            {loading && (
              <Spinner />
            )}
            {!loading && blobUrl && isImage && (
              <AspectRatio ratio={1 / 1}>
                <img src={blobUrl} alt={document.title} className='w-full h-full object-contain' />
              </AspectRatio>
            )}
            {!loading && blobUrl && isPdf && (
              <embed
                src={`${blobUrl}#page=1&toolbar=0&navpanes=0`}
                type='application/pdf'
                className='w-full h-full'
              />
            )}
          </div>

          <DialogContent>
            <PreviewDialogInner document={document} loading={loading} blobUrl={blobUrl} isImage={isImage} isPdf={isPdf} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
