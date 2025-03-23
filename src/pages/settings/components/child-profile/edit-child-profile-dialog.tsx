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
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export type EditChildProfileDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  profileId: string | null
  initialEditProfileState: {
    name: string
    age: string
    interests: string
  }
  onEditProfile: (
    profileId: string,
    profile: {
      name: string
      age: number
      interests: string
    }
  ) => Promise<Id<'childProfiles'>>
  onSuccess: () => void
}

export function EditChildProfileDialog({
  isOpen,
  onOpenChange,
  profileId,
  initialEditProfileState,
  onEditProfile,
  onSuccess,
}: EditChildProfileDialogProps) {
  const [name, setName] = useState(initialEditProfileState.name)
  const [age, setAge] = useState(initialEditProfileState.age)
  const [interests, setInterests] = useState(initialEditProfileState.interests)

  // Update state when props change
  // TODO: Check if we really need this
  // Why do we need this?
  useEffect(() => {
    setName(initialEditProfileState.name)
    setAge(initialEditProfileState.age)
    setInterests(initialEditProfileState.interests)
  }, [initialEditProfileState])

  const handleEditProfile = async () => {
    if (!profileId || !name || !age) {
      toast.error('Name and age are required')
      return
    }

    const [error] = await handlePromise(
      onEditProfile(profileId, {
        name,
        age: Number(age),
        interests,
      })
    )

    if (error) {
      toast.error('Failed to update child profile')
      return
    }

    toast.success('Child profile updated successfully')
    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Child Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div>
            <Label htmlFor="edit-name">Child&apos;s Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter child's name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="edit-age">Child&apos;s Age</Label>
            <Input
              id="edit-age"
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
            <Label htmlFor="edit-interests">Child&apos;s Interests</Label>
            <InputWithFeedback
              id="edit-interests"
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
          <Button onClick={handleEditProfile}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
