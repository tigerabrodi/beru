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
import { Id } from '@convex/_generated/dataModel'
import { ConvexError } from 'convex/values'
import { useState } from 'react'
import { toast } from 'sonner'

export type DeleteAlertDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  deleteProfileState: {
    name: string
    id: Id<'childProfiles'> | null
  }
  onDelete: (deletingProfileId: Id<'childProfiles'>) => Promise<boolean>
}

export function DeleteChildProfileDialog({
  isOpen,
  onOpenChange,
  deleteProfileState,
  onDelete,
  onSuccess,
}: DeleteAlertDialogProps) {
  const [status, setStatus] = useState<Status>('idle')

  const handleDelete = async () => {
    if (!deleteProfileState.id) return
    setStatus('loading')

    const [error] = await handlePromise(onDelete(deleteProfileState.id))
    if (error) {
      if (error instanceof ConvexError) {
        toast.error(error.data as string)
      } else {
        toast.error('Failed to delete child profile')
      }

      setStatus('error')
      return
    }

    setStatus('success')
    onSuccess()
    onOpenChange(false)
  }

  const isLoading = status === 'loading'

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the profile for{' '}
            <span className="font-medium">{deleteProfileState.name}</span>. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
