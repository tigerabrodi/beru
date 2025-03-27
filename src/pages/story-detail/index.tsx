import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'
import { cn, handlePromise } from '@/lib/utils'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useAction, useMutation, useQuery } from 'convex/react'
import { FunctionReturnType } from 'convex/server'
import { ConvexError } from 'convex/values'
import { ArrowLeft, Star } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { StoryAudioPlayer } from './components/story-audio-player'
import { StoryContent } from './components/story-content'

type StoryWithAudioUrl = FunctionReturnType<
  typeof api.stories.queries.getStoryById
>

export function StoryDetailPage() {
  const params = useParams()
  const storyId = params.id as Id<'stories'>

  const generateStoryVoice = useAction(api.stories.actions.generateStoryVoice)

  const toggleFavorite = useMutation(
    api.stories.mutations.toggleFavorite
  ).withOptimisticUpdate((localStore, args) => {
    const { storyId } = args

    const existingStory = localStore.getQuery(
      api.stories.queries.getStoryById,
      {
        storyId,
      }
    )

    const existingStories = localStore.getQuery(
      api.stories.queries.getAllStoriesForCurrentUser
    )

    if (!existingStory || !existingStories) return

    const updatedStory: StoryWithAudioUrl = {
      ...existingStory,
      isFavorite: !existingStory?.isFavorite,
    }

    const updatedStories = existingStories.map((story) =>
      story._id === storyId ? updatedStory : story
    )

    localStore.setQuery(
      api.stories.queries.getStoryById,
      { storyId },
      updatedStory
    )
    localStore.setQuery(
      api.stories.queries.getAllStoriesForCurrentUser,
      {},
      updatedStories
    )
  })

  const story = useQuery(api.stories.queries.getStoryById, {
    storyId,
  })

  const [clientSideAudioStatus, setClientSideAudioStatus] = useState<
    'pending' | 'generating' | 'ready' | 'error'
  >('pending')

  const handleGenerateStoryVoice = useCallback(async () => {
    // pending means we need to generate the audio for this story
    // client side audio status is used to prevent duplicate audio generation
    // it's more of a safety net in case the server side audio status is not updated on time
    if (clientSideAudioStatus === 'generating') return

    setClientSideAudioStatus('generating')

    const [error] = await handlePromise(generateStoryVoice({ storyId }))

    if (error) {
      setClientSideAudioStatus('error')
      if (error instanceof ConvexError) {
        toast.error(error.data as string)
      } else {
        toast.error('Failed to generate audio for story.')
      }
    }

    setClientSideAudioStatus('ready')
  }, [clientSideAudioStatus, generateStoryVoice, storyId])

  useEffect(() => {
    if (clientSideAudioStatus === 'ready' || clientSideAudioStatus === 'error')
      return
    if (!story) return
    if (story.audioStatus !== 'pending') return

    void handleGenerateStoryVoice()
  }, [clientSideAudioStatus, handleGenerateStoryVoice, story])

  // loading still
  if (story === undefined) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    )
  }

  // empty
  if (story === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-bold">Story not found</h1>
        <Link to={ROUTES.dashboard}>
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link to={ROUTES.dashboard}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFavorite({ storyId })}
          className={cn({
            'text-yellow-500': story.isFavorite,
          })}
        >
          <Star
            className={cn('size-6', {
              'fill-yellow-500': story.isFavorite,
            })}
          />
          <span className="sr-only">
            {story.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          </span>
        </Button>
      </div>

      <div>
        <h1 className="mb-2 text-3xl font-bold">{story.title}</h1>
        <p className="text-muted-foreground">
          Created for {story.childName} with {story.voiceName} voice
        </p>
      </div>

      <StoryAudioPlayer
        audioUrl={story.audioUrl}
        audioStatus={story.audioStatus}
        onRetry={handleGenerateStoryVoice}
        clientSideAudioStatus={clientSideAudioStatus}
      />

      <div className="w-full">
        <Card className="w-full p-6">
          <StoryContent content={story.content} />
        </Card>
      </div>
    </div>
  )
}
