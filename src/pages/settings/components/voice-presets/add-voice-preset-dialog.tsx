import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { handlePromise } from '@/lib/utils'
import { api } from '@convex/_generated/api'
import { useAction } from 'convex/react'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface AddVoicePresetDialogProps {
  showEmptyState?: boolean
}

export function AddVoicePresetDialog({
  showEmptyState = false,
}: AddVoicePresetDialogProps) {
  const addVoicePreset = useAction(api.voicePresets.actions.generateVoicePreset)
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const resetForm = () => {
    setName('')
    setDescription('')
  }

  const handleAddPreset = async () => {
    if (!name || !description) {
      toast.error('Name and description are required')
      return
    }

    const [error] = await handlePromise(
      addVoicePreset({
        name,
        description,
      })
    )

    if (error) {
      toast.error('Failed to add voice preset')
      return
    }

    toast.success('Voice preset added successfully')
    resetForm()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {showEmptyState ? (
          <Button variant="link" className="mt-2">
            Add your first voice preset
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="size-4" />
            Add Voice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Voice Preset</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div>
            <Label htmlFor="voice-name">Voice Name</Label>
            <Input
              id="voice-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Friendly Grandma"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="voice-description">Voice Description</Label>
            <Textarea
              id="voice-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the voice in detail (e.g. A warm, gentle voice like a loving grandmother telling bedtime stories)"
              className="mt-1 resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddPreset}>Add Voice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
