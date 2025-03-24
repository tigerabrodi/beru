import { InputWithFeedback } from '@/components/input-with-feedback'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Doc, Id } from '@convex/_generated/dataModel'
import { Check, PlusCircle, User } from 'lucide-react'
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
        <div className="flex max-h-[300px] flex-col gap-3 overflow-y-auto pr-2">
          {childProfiles.map((profile) => {
            const isSelected = selectedChildId === profile._id
            return (
              <Card
                key={profile._id}
                className={cn(
                  'hover:bg-muted/60 relative flex cursor-pointer flex-row items-center gap-3 border-2 p-2 transition-colors',
                  {
                    'bg-primary/10 border-primary shadow-sm': isSelected,
                    'border-transparent': !isSelected,
                  }
                )}
                onClick={() => onSelectChild(profile._id)}
              >
                {isSelected && (
                  <div className="bg-primary absolute top-1/2 left-2 shrink-0 -translate-y-1/2 rounded-full p-1">
                    <Check className="text-primary-foreground size-3.5" />
                  </div>
                )}
                <div className="flex-1 pl-8">
                  <p className="font-medium">
                    {profile.name}, {profile.age} years old
                  </p>
                  <p className="text-muted-foreground line-clamp-2 overflow-hidden text-sm">
                    <span className="font-medium">Interests:</span>{' '}
                    {profile.interests}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
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
