import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Doc, Id } from '@convex/_generated/dataModel'
import { Check, Mic, PlusCircle } from 'lucide-react'
import { useState } from 'react'

type VoicePreferenceSelectorProps = {
  selectedVoiceId: string | null
  onSelectVoice: (voiceId: Id<'voicePresets'> | null) => void
  voicePresets: Array<Doc<'voicePresets'>>
}

export function VoicePreferenceSelector({
  selectedVoiceId,
  onSelectVoice,
  voicePresets,
}: VoicePreferenceSelectorProps) {
  const [isManualEntry, setIsManualEntry] = useState(voicePresets.length === 0)
  const [manualName, setManualName] = useState('')
  const [manualDescription, setManualDescription] = useState('')

  const handleToggleManualEntry = () => {
    setIsManualEntry(!isManualEntry)
    if (!isManualEntry) {
      onSelectVoice(null)
    } else if (voicePresets.length > 0) {
      onSelectVoice(voicePresets[0]._id)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {voicePresets.length > 0 && (
        <div className="flex flex-col-reverse items-start justify-between gap-4 md:flex-row md:items-center md:gap-0">
          <h3 className="text-sm font-medium">
            {isManualEntry
              ? 'Enter voice details manually'
              : 'Select a saved voice preset'}
          </h3>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleToggleManualEntry}
            className="gap-2"
          >
            {isManualEntry ? (
              <>
                <Mic className="size-4" />
                Use Saved Voice
              </>
            ) : (
              <>
                <PlusCircle className="size-4" />
                Enter Manually
              </>
            )}
          </Button>
        </div>
      )}

      {!isManualEntry && voicePresets.length > 0 ? (
        <div className="flex max-h-[300px] flex-col gap-3 overflow-y-auto pr-2">
          {voicePresets.map((preset) => {
            const isSelected = selectedVoiceId === preset._id
            return (
              <Card
                key={preset._id}
                className={cn(
                  'hover:bg-muted/60 relative flex cursor-pointer flex-row items-center gap-3 border-2 p-2 transition-colors',
                  {
                    'bg-primary/10 border-primary shadow-sm': isSelected,
                    'border-transparent': !isSelected,
                  }
                )}
                onClick={() => onSelectVoice(preset._id)}
              >
                {isSelected && (
                  <div className="bg-primary absolute top-1/2 left-2 shrink-0 -translate-y-1/2 rounded-full p-1">
                    <Check className="text-primary-foreground size-3.5" />
                  </div>
                )}
                <div className="flex-1 pl-8">
                  <p className="font-medium">{preset.name}</p>
                  <p className="text-muted-foreground line-clamp-2 overflow-hidden text-sm">
                    {preset.description}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="voice-name">Voice Name</Label>
            <Input
              id="voice-name"
              name="voiceName"
              value={manualName}
              required
              onChange={(event) => setManualName(event.target.value)}
              placeholder="E.g. Friendly Grandma"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="voice-description">Voice Description</Label>
            <Textarea
              id="voice-description"
              name="voiceDescription"
              value={manualDescription}
              required
              onChange={(event) => setManualDescription(event.target.value)}
              placeholder="Describe the voice in detail (e.g. A warm, gentle voice like a loving grandmother telling bedtime stories)"
              className="mt-1 resize-none"
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  )
}
