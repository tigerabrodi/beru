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
import { Textarea } from '@/components/ui/textarea'
import { handlePromise } from '@/lib/utils'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface EditVoicePresetDialogProps {
  preset: {
    id: Id<'voicePresets'>
    name: string
    description: string
  } | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function EditVoicePresetDialog({
  preset,
  isOpen,
  onOpenChange,
}: EditVoicePresetDialogProps) {
  const updateVoicePreset = useMutation(
    api.voicePresets.mutations.updateVoicePreset
  )
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (preset) {
      setName(preset.name)
      setDescription(preset.description)
    }
  }, [preset])

  const resetForm = () => {
    setName('')
    setDescription('')
  }

  const handleEditPreset = async () => {
    if (!preset?.id || !name || !description) {
      toast.error('Name and description are required')
      return
    }

    const [error] = await handlePromise(
      updateVoicePreset({
        presetId: preset.id,
        name,
        description,
      })
    )

    if (error) {
      toast.error('Failed to update voice preset')
      return
    }

    toast.success('Voice preset updated successfully')
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Voice Preset</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div>
            <Label htmlFor="edit-voice-name">Voice Name</Label>
            <Input
              id="edit-voice-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="E.g. Friendly Grandma"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="edit-voice-description">Voice Description</Label>
            <Textarea
              id="edit-voice-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the voice in detail"
              className="mt-1 resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditPreset}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
