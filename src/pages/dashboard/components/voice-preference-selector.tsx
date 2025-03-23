import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Doc, Id } from '@convex/_generated/dataModel'
import { Mic, PlusCircle } from 'lucide-react'
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
        <RadioGroup
          value={selectedVoiceId || ''}
          onValueChange={(value) => onSelectVoice(value as Id<'voicePresets'>)}
          className="flex max-h-[300px] flex-col gap-3 overflow-y-auto pr-2"
        >
          {voicePresets.map((preset) => (
            <div
              key={preset._id}
              className="hover:bg-muted flex cursor-pointer items-center space-x-2 rounded-md border p-3"
              onClick={() => onSelectVoice(preset._id)}
            >
              <RadioGroupItem value={preset._id} id={preset._id} />
              <div className="flex-1">
                <Label
                  htmlFor={preset._id}
                  className="cursor-pointer font-medium"
                >
                  {preset.name}
                </Label>
                <p className="text-muted-foreground line-clamp-2 h-10 overflow-hidden text-sm">
                  {preset.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="voice-name">Voice Name</Label>
            <Input
              id="voice-name"
              name="voiceName"
              value={manualName}
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
