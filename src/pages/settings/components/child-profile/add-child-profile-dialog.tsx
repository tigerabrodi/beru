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
import { handlePromise } from '@/lib/utils'
import { Id } from '@convex/_generated/dataModel'
import { ConvexError } from 'convex/values'
import { useActionState, useState } from 'react'
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

type FormState = {
  status: 'error' | 'success' | 'idle'
}

export function AddChildProfileDialog({
  isOpen,
  onOpenChange,
  onAddProfile,
}: AddChildProfileDialogProps) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [interests, setInterests] = useState('')

  const resetForm = () => {
    setName('')
    setAge('')
    setInterests('')
  }

  const [, formAction, isLoading] = useActionState<FormState, FormData>(
    async () => {
      if (!name || !age) {
        toast.error('Name and age are required')
        return { status: 'error' }
      }

      const [error] = await handlePromise(
        onAddProfile({
          name,
          age: Number(age),
          interests,
        })
      )

      if (error) {
        if (error instanceof ConvexError) {
          toast.error(error.data as string)
        } else {
          toast.error('Failed to add child profile')
        }

        return { status: 'error' }
      }

      toast.success('Child profile added successfully')
      resetForm()
      onOpenChange(false)

      return { status: 'success' }
    },
    { status: 'idle' }
  )

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction}>
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
            <Button type="submit" isLoading={isLoading} loadingText="Adding...">
              Add Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
