import { storyIdeasSchema } from '@convex/stories/actions'
import { z } from 'zod'

export type StoryIdeas = z.infer<typeof storyIdeasSchema>
