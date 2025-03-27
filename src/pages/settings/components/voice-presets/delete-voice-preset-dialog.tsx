import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Status } from '@/lib/schemas'
import { handlePromise } from '@/lib/utils'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useAction } from 'convex/react'
import { ConvexError } from 'convex/values'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface DeleteVoicePresetDialogProps {
  presetId: Id<'voicePresets'> | null
  presetName: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteVoicePresetDialog({
  presetId,
  presetName,
  isOpen,
  onOpenChange,
}: DeleteVoicePresetDialogProps) {
  const deleteVoicePreset = useAction(
    api.voicePresets.actions.deleteVoicePreset
  )

  const [deleteStatus, setDeleteStatus] = useState<Status>('idle')

  const handleDeletePreset = async () => {
    if (presetId) {
      setDeleteStatus('loading')
      const [error] = await handlePromise(deleteVoicePreset({ presetId }))

      if (error) {
        if (error instanceof ConvexError) {
          toast.error(error.data as string)
        } else {
          toast.error('Failed to delete voice preset')
        }

        setDeleteStatus('error')
        return
      }

      setDeleteStatus('success')
      toast.success('Voice preset deleted successfully')
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the voice preset{' '}
            <span className="font-medium">{presetName}</span>. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeletePreset}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteStatus === 'loading'}
          >
            {deleteStatus === 'loading' ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
