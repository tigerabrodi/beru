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
import { handlePromise } from '@/lib/utils'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
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
  const deleteVoicePreset = useMutation(
    api.voicePresets.mutations.deleteVoicePreset
  )

  const handleDeletePreset = async () => {
    if (presetId) {
      const [error] = await handlePromise(deleteVoicePreset({ presetId }))

      if (error) {
        toast.error('Failed to delete voice preset')
        return
      }

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
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
