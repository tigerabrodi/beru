import { InputWithFeedback } from '@/components/input-with-feedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Doc, Id } from '@convex/_generated/dataModel'
import { PlusCircle, User } from 'lucide-react'
import { useState } from 'react'

type ChildProfileSelectorProps = {
  selectedChildId: string | null
  childProfiles: Array<Doc<'childProfiles'>>
  onSelectChild: (childId: Id<'childProfiles'> | null) => void
}

export function ChildProfileSelector({
  selectedChildId,
  onSelectChild,
  childProfiles,
}: ChildProfileSelectorProps) {
  const [isManualEntry, setIsManualEntry] = useState(childProfiles.length === 0)
  const [manualName, setManualName] = useState('')
  const [manualAge, setManualAge] = useState('')
  const [manualInterests, setManualInterests] = useState('')

  const handleToggleManualEntry = () => {
    setIsManualEntry(!isManualEntry)
    if (!isManualEntry) {
      onSelectChild(null)
    } else if (childProfiles.length > 0) {
      onSelectChild(childProfiles[0]._id)
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {childProfiles.length > 0 && (
        <div className="flex flex-col-reverse items-start justify-between gap-4 md:flex-row md:items-center md:gap-0">
          <h3 className="text-sm font-medium">
            {isManualEntry
              ? 'Enter child details manually'
              : 'Select a saved profile'}
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
                <User className="size-4" />
                Use Saved Profile
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

      {!isManualEntry && childProfiles.length > 0 ? (
        <RadioGroup
          value={selectedChildId || ''}
          onValueChange={(value) => onSelectChild(value as Id<'childProfiles'>)}
          className="flex max-h-[300px] flex-col gap-3 overflow-y-auto pr-2"
        >
          {childProfiles.map((profile) => (
            <div
              key={profile._id}
              className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border p-3"
              onClick={() => {
                console.log('profile', profile)
                onSelectChild(profile._id)
              }}
            >
              <RadioGroupItem value={profile._id} id={profile._id} />
              <div className="flex-1">
                <Label
                  htmlFor={profile._id}
                  className="cursor-pointer font-medium"
                >
                  {profile.name}, {profile.age} years old
                </Label>
                <p className="text-muted-foreground line-clamp-2 h-10 overflow-hidden text-sm">
                  Interests: {profile.interests}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="child-name">Child&apos;s Name</Label>
            <Input
              id="child-name"
              name="childName"
              required
              value={manualName}
              onChange={(event) => setManualName(event.target.value)}
              placeholder="Enter child's name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="child-age">Child&apos;s Age</Label>
            <Input
              id="child-age"
              name="childAge"
              required
              value={manualAge}
              onChange={(event) =>
                // regex is just a safety net to prevent non-numeric characters
                setManualAge(event.target.value.replace(/[^0-9]/g, ''))
              }
              placeholder="Enter child's age"
              type="number"
              min="1"
              max="12"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="child-interests">Child&apos;s Interests</Label>
            <InputWithFeedback
              id="child-interests"
              name="childInterests"
              required
              value={manualInterests}
              onChange={(event) => setManualInterests(event.target.value)}
              placeholder="E.g. dinosaurs, space, princesses"
              className="mt-1"
              helperText="Separate multiple interests with commas"
            />
          </div>
        </div>
      )}
    </div>
  )
}
