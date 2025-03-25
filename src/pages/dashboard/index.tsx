import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'
import { Status } from '@/lib/schemas'
import { handlePromise } from '@/lib/utils'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { StoryIdeasType } from '@convex/stories/actions'
import { useAction, useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import { Sparkles } from 'lucide-react'
import { useActionState, useEffect, useState } from 'react'
import { generatePath, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { ChildProfileSelector } from './components/child-profile-selector'
import { StoryIdeas } from './components/story-ideas'
import { VoicePreferenceSelector } from './components/voice-preference-selector'

type ChildProfileInput =
  | {
      childName: string
      childAge: number
      childInterests: string
    }
  | {
      childId: Id<'childProfiles'>
    }

type VoicePresetInput =
  | {
      voiceName: string
      voiceDescription: string
    }
  | {
      voicePresetId: Id<'voicePresets'>
    }

type StoriesWithMetadata = {
  stories: StoryIdeasType
  metadata: {
    childProfileInput: ChildProfileInput
    voicePresetInput: VoicePresetInput
  }
}

type FormState = {
  status: 'error' | 'success' | 'idle'
}

export function DashboardPage() {
  const navigate = useNavigate()
  const childProfiles = useQuery(api.childProfiles.queries.getChildProfiles)
  const voicePresets = useQuery(api.voicePresets.queries.getVoicePresets)
  const generateStoryIdeas = useAction(api.stories.actions.generateStoryIdeas)
  const createStory = useAction(api.stories.actions.generateStory)

  const [selectedChildId, setSelectedChildId] =
    useState<Id<'childProfiles'> | null>(null)
  const [selectedVoiceId, setSelectedVoiceId] =
    useState<Id<'voicePresets'> | null>(null)
  const [storiesWithMetadata, setStoriesWithMetadata] =
    useState<StoriesWithMetadata | null>(null)
  const [generatingStoryState, setGeneratingStoryState] = useState<{
    status: Status
    storyId: string
  }>({
    status: 'idle',
    storyId: '',
  })

  useEffect(() => {
    if (childProfiles && childProfiles.length > 0) {
      setSelectedChildId(childProfiles[0]._id)
    }

    if (voicePresets && voicePresets.length > 0) {
      setSelectedVoiceId(voicePresets[0]._id)
    }
  }, [childProfiles, voicePresets])

  const [, formAction, isGeneratingStoryIdeas] = useActionState<
    FormState,
    FormData
  >(
    async (_, formData) => {
      const childProfileInput: ChildProfileInput = selectedChildId
        ? { childId: selectedChildId }
        : {
            childName: formData.get('childName') as string,
            childAge: parseInt(formData.get('childAge') as string),
            childInterests: formData.get('childInterests') as string,
          }

      const voicePresetInput: VoicePresetInput = selectedVoiceId
        ? { voicePresetId: selectedVoiceId }
        : {
            voiceName: formData.get('voiceName') as string,
            voiceDescription: formData.get('voiceDescription') as string,
          }

      const [error, stories] = await handlePromise(
        generateStoryIdeas({ input: childProfileInput })
      )

      if (error) {
        if (error instanceof ConvexError) {
          toast.error(error.data as string)
        } else {
          toast.error('Failed to generate story ideas')
        }

        return { status: 'error' }
      }

      // Store both stories and metadata
      setStoriesWithMetadata({
        stories: stories as StoryIdeasType,
        metadata: {
          childProfileInput,
          voicePresetInput,
        },
      })

      return { status: 'success' }
    },
    { status: 'idle' }
  )

  const handleGenerateStory = async (id: string) => {
    if (!storiesWithMetadata) {
      toast.error('No story ideas generated')
      return
    }

    setGeneratingStoryState({
      status: 'loading',
      storyId: id,
    })

    const selectedIdea = storiesWithMetadata.stories.find(
      (story) => story.id === id
    )

    if (!selectedIdea) {
      toast.error('Idea not found')
      setGeneratingStoryState({
        status: 'error',
        storyId: id,
      })
      return
    }

    const [error, newStoryId] = await handlePromise(
      createStory({
        idea: selectedIdea,
        voicePresetInput: storiesWithMetadata.metadata.voicePresetInput,
        childProfileInput: storiesWithMetadata.metadata.childProfileInput,
      })
    )

    if (error) {
      if (error instanceof ConvexError) {
        toast.error(error.data as string)
      } else {
        toast.error('Failed to create story')
      }

      setGeneratingStoryState({
        status: 'error',
        storyId: '',
      })
      return
    }

    setGeneratingStoryState({
      status: 'success',
      storyId: '',
    })
    toast.success('Story created successfully')
    void navigate(generatePath(ROUTES.storyDetail, { id: newStoryId }))
  }

  const isGeneratingStory = generatingStoryState.status === 'loading'

  return (
    <form className="flex flex-col gap-5 md:gap-8" action={formAction}>
      <div>
        <h1 className="mb-2 text-3xl font-bold">Create a Story</h1>
        <p className="text-muted-foreground">
          Generate personalized stories for your child
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Child Profile</CardTitle>
            <CardDescription>Select or enter child information</CardDescription>
          </CardHeader>
          <CardContent>
            <ChildProfileSelector
              selectedChildId={selectedChildId}
              onSelectChild={setSelectedChildId}
              childProfiles={childProfiles ?? []}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice Preference</CardTitle>
            <CardDescription>Select or enter voice preference</CardDescription>
          </CardHeader>
          <CardContent>
            <VoicePreferenceSelector
              selectedVoiceId={selectedVoiceId}
              onSelectVoice={setSelectedVoiceId}
              voicePresets={voicePresets ?? []}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          size="lg"
          type="submit"
          disabled={isGeneratingStoryIdeas || isGeneratingStory}
          className="gap-2"
          loadingText="Generating ideas..."
          isLoading={isGeneratingStoryIdeas}
        >
          <Sparkles className="size-4" />
          Generate Story Ideas
        </Button>
      </div>

      {storiesWithMetadata && storiesWithMetadata.stories.length > 0 && (
        <StoryIdeas
          ideas={storiesWithMetadata.stories}
          onSelectIdea={handleGenerateStory}
          isGeneratingStory={isGeneratingStory}
          generatingStoryId={generatingStoryState.storyId}
        />
      )}
    </form>
  )
}
