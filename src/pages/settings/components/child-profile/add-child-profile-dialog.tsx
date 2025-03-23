import { InputWithFeedback } from '@/components/input-with-feedback'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Status } from '@/lib/schemas'
import { handlePromise } from '@/lib/utils'
import { Id } from '@convex/_generated/dataModel'
import { useState } from 'react'
import { toast } from 'sonner'

export type AddChildProfileDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAddProfile: (profile: {
    name: string
    age: number
    interests: string
  }) => Promise<Id<'childProfiles'>>
}

export function AddChildProfileDialog({
  isOpen,
  onOpenChange,
  onAddProfile,
}: AddChildProfileDialogProps) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [interests, setInterests] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const resetForm = () => {
    setName('')
    setAge('')
    setInterests('')
  }

  const handleAddProfile = async () => {
    if (!name || !age) {
      toast.error('Name and age are required')
      return
    }

    setStatus('loading')

    const [error] = await handlePromise(
      onAddProfile({
        name,
        age: Number(age),
        interests,
      })
    )

    if (error) {
      toast.error('Failed to add child profile')
      setStatus('error')
      return
    }

    setStatus('success')
    toast.success('Child profile added successfully')
    resetForm()
    onOpenChange(false)
  }

  const isLoading = status === 'loading'

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Child Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div>
            <Label htmlFor="name">Child&apos;s Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter child's name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="age">Child&apos;s Age</Label>
            <Input
              id="age"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              placeholder="Enter child's age"
              type="number"
              min="1"
              max="12"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="interests">Child&apos;s Interests</Label>
            <InputWithFeedback
              id="interests"
              value={interests}
              onChange={(event) => setInterests(event.target.value)}
              placeholder="E.g. dinosaurs, space, princesses"
              className="mt-1"
              helperText="Separate multiple interests with commas"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddProfile} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Adding...
              </>
            ) : (
              'Add Profile'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
