import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { FunctionReturnType } from 'convex/server'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AddVoicePresetDialog } from './add-voice-preset-dialog'
import { DeleteVoicePresetDialog } from './delete-voice-preset-dialog'
import { EditVoicePresetDialog } from './edit-voice-preset-dialog'

type VoicePresetFromGetVoicePresets = FunctionReturnType<
  typeof api.voicePresets.queries.getVoicePresets
>[number]

export function VoicePresetSettings() {
  const voicePresets = useQuery(api.voicePresets.queries.getVoicePresets)

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<{
    id: Id<'voicePresets'>
    name: string
    description: string
    sampleAudioUrl: string | null
  } | null>(null)
  const [deletingPresetId, setDeletingPresetId] =
    useState<Id<'voicePresets'> | null>(null)
  const [deletingPresetName, setDeletingPresetName] = useState('')

  const openDeleteDialog = (preset: VoicePresetFromGetVoicePresets) => {
    setDeletingPresetId(preset._id)
    setDeletingPresetName(preset.name)
    setIsDeleteDialogOpen(true)
  }

  const openEditDialog = (preset: VoicePresetFromGetVoicePresets) => {
    setEditingPreset({
      id: preset._id,
      name: preset.name,
      description: preset.description,
      sampleAudioUrl: preset.sampleAudioUrl,
    })
    setIsEditDialogOpen(true)
  }

  if (voicePresets === undefined) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-xl font-bold">Voice Presets</h2>
            <p className="text-muted-foreground">
              Manage saved voice presets for story narration
            </p>
          </div>

          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid max-h-[450px] grid-cols-1 gap-4 overflow-y-auto pr-2 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-xl font-bold">Voice Presets</h2>
          <p className="text-muted-foreground">
            Manage saved voice presets for story narration
          </p>
        </div>

        <AddVoicePresetDialog />

        <EditVoicePresetDialog
          preset={editingPreset}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />

        <DeleteVoicePresetDialog
          presetId={deletingPresetId}
          presetName={deletingPresetName}
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      </div>

      {voicePresets.length === 0 ? (
        <div className="bg-muted/30 rounded-lg border py-8 text-center">
          <p className="text-muted-foreground">No voice presets yet</p>
          <AddVoicePresetDialog showEmptyState />
        </div>
      ) : (
        <div className="grid max-h-[450px] grid-cols-1 gap-4 overflow-y-auto pr-2 md:grid-cols-2">
          {voicePresets.map((preset) => (
            <Card key={preset._id}>
              <CardHeader>
                <CardTitle>{preset.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {preset.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openDeleteDialog(preset)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openEditDialog(preset)}
                >
                  <Edit className="size-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
