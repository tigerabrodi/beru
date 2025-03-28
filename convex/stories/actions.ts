'use node'

import { createOpenAI } from '@ai-sdk/openai'
import { getAuthUserId } from '@convex-dev/auth/server'
import { generateObject, generateText } from 'ai'
import { ConvexError, v } from 'convex/values'
import { HumeClient, HumeError, HumeTimeoutError } from 'hume'
import { ReturnTts } from 'hume/api/resources/tts'
import { z } from 'zod'
import { api, internal } from '../_generated/api'
import { Doc, Id } from '../_generated/dataModel'
import { action } from '../_generated/server'
import { handlePromise } from '../lib/utils'

export const storyIdeasSchema = z.object({
  stories: z
    .array(
      z.object({
        title: z
          .string()
          .describe(
            'A catchy, child-friendly title for the bedtime story. No more than 6-10 words.'
          ),
        description: z
          .string()
          .describe(
            "A brief 1-2 sentences description that previews the story's plot. It's important parents understand what the story is about and can ask their kid if they want to hear it."
          ),
        id: z.string().describe('The unique ID of the story idea'),
      })
    )
    .describe('Five unique bedtime story ideas for a child'),
})

export type StoryIdeasType = z.infer<typeof storyIdeasSchema.shape.stories>

const GenerateStoryIdeasArgs = v.union(
  v.object({
    childId: v.id('childProfiles'),
  }),
  v.object({
    childName: v.string(),
    childAge: v.number(),
    childInterests: v.string(),
  })
)

/**
 * Generate story ideas based on child profile and preferences
 */
export const generateStoryIdeas = action({
  args: {
    input: GenerateStoryIdeasArgs,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    // Get OpenAI API key
    const apiKey = (await ctx.runAction(
      api.users.actions.getOpenAiApiKey
    )) as string

    if (!apiKey) {
      throw new ConvexError(
        'OpenAI API key not found. Please add your API key in settings.'
      )
    }

    let childProfile: Doc<'childProfiles'> | null = null

    // If childId is provided, retrieve full profile
    if ('childId' in args.input) {
      const [childProfileError, childProfileResult] = await handlePromise(
        ctx.runQuery(api.childProfiles.queries.getChildProfile, {
          childId: args.input.childId,
        })
      )

      if (childProfileError) {
        throw new ConvexError('Failed to get child profile')
      }

      if (!childProfileResult) {
        console.log('childProfileResult', childProfileResult)
        throw new ConvexError('Child profile not found')
      }

      childProfile = childProfileResult
    }

    const allExistingStories = await ctx.runQuery(
      api.stories.queries.getAllStoriesForCurrentUser
    )

    const allExistingStoryTitles =
      allExistingStories && allExistingStories.length > 0
        ? allExistingStories.map((story) => story.title).join(', ')
        : null

    // Initialize OpenAI client
    const openai = createOpenAI({
      apiKey,
    })

    // Build prompt based on available information
    let prompt = ''

    if ('childId' in args.input) {
      prompt += `Generate 5 bedtime story ideas for ${childProfile!.name}, who is ${childProfile!.age} years old and interested in ${childProfile!.interests}`
    } else {
      prompt += `Generate 5 bedtime story ideas for ${args.input.childName}, who is ${args.input.childAge} years old,  and interested in ${args.input.childInterests}`
    }

    prompt += `. Each story idea should be child-appropriate, engaging, and suitable for bedtime reading. Each idea should have a title and a description.`

    // We do this to provide a better experience for the user
    if (allExistingStoryTitles) {
      prompt += `\n\nHere are some story titles that are already taken, you should avoid using them: ${allExistingStoryTitles}`
    }

    // Generate story ideas using OpenAI
    const [error, generateObjResult] = await handlePromise(
      generateObject({
        model: openai('gpt-4o'),
        schema: storyIdeasSchema,
        prompt,
      })
    )

    if (error) {
      console.error(error)
      throw new ConvexError(
        'Failed to generate story ideas. Maybe your OpenAI API key is not correct.'
      )
    }

    if (!generateObjResult) {
      throw new ConvexError(
        'Failed to generate story ideas. Something went wrong. Please try again. Maybe check your OpenAI credits.'
      )
    }

    return generateObjResult.object.stories
  },
})

const ChildProfileInput = v.union(
  v.object({
    childId: v.id('childProfiles'),
  }),
  v.object({
    childName: v.string(),
    childAge: v.number(),
    childInterests: v.string(),
  })
)

const VoicePresetInput = v.union(
  v.object({
    voicePresetId: v.id('voicePresets'),
  }),
  v.object({
    voiceName: v.string(),
    voiceDescription: v.string(),
  })
)

/**
 * Generate full story based on selected idea
 */
export const generateStory = action({
  args: {
    idea: v.object({
      title: v.string(),
      description: v.string(),
      id: v.string(),
    }),

    voicePresetInput: VoicePresetInput,
    childProfileInput: ChildProfileInput,
  },
  handler: async (ctx, args): Promise<Id<'stories'>> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    // Get OpenAI API key
    const [apiKeyError, apiKey] = await handlePromise(
      ctx.runAction(api.users.actions.getOpenAiApiKey)
    )

    if (apiKeyError || !apiKey) {
      throw new ConvexError(
        'OpenAI API key not found. Please add your API key in settings.'
      )
    }

    let childProfile: Doc<'childProfiles'> | null = null
    let voicePreset: Doc<'voicePresets'> | null = null

    // If childId is provided, retrieve full profile
    if ('childId' in args.childProfileInput) {
      const [childProfileError, childProfileResult] = await handlePromise(
        ctx.runQuery(api.childProfiles.queries.getChildProfile, {
          childId: args.childProfileInput.childId,
        })
      )

      if (childProfileError) {
        throw new ConvexError('Failed to get child profile')
      }

      if (!childProfileResult) {
        throw new ConvexError('Child profile not found')
      }

      childProfile = childProfileResult
    }

    // If voicePresetId is provided, retrieve full preset
    if ('voicePresetId' in args.voicePresetInput) {
      const [voicePresetError, voicePresetResult] = await handlePromise(
        ctx.runQuery(api.voicePresets.queries.getVoicePresetById, {
          presetId: args.voicePresetInput.voicePresetId,
        })
      )

      if (voicePresetError) {
        throw new ConvexError('Failed to get voice preset')
      }

      if (!voicePresetResult) {
        throw new ConvexError('Voice preset not found')
      }

      voicePreset = voicePresetResult
    }

    // Initialize OpenAI client
    const openai = createOpenAI({
      apiKey,
    })

    // Build prompt based on available information
    let prompt = `Write a bedtime story titled "${args.idea.title}" based on this description: ${args.idea.description}. `

    if ('childId' in args.childProfileInput) {
      prompt += `This story is for ${childProfile!.name} who is ${childProfile!.age} years old and likes ${childProfile!.interests}`
    } else {
      prompt += `This story is for ${args.childProfileInput.childName} who is ${args.childProfileInput.childAge} years old and likes ${args.childProfileInput.childInterests}`
    }

    prompt += `. The story should:
      - Be appropriate for a child's bedtime reading
      - Be around 800-1000 words.
      - Very strict: No more than 5000 characters! Make it shorter if needed!
      - Have a clear beginning, middle, and end
      - Include a positive message or moral
      - Use age-appropriate language and concepts
      - Encourage imagination and wonder
      - End with a calm, peaceful conclusion suitable for bedtime
      
      Format the story with proper paragraphs and include a couple of sentences of dialogue where appropriate. Make it engaging, but calming - perfect for bedtime.`

    // Generate full story using OpenAI
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt,
    })

    try {
      const storyId = await ctx.runMutation(
        internal.stories.mutations.createStory,
        {
          title: args.idea.title,
          content: text,
          childId:
            'childId' in args.childProfileInput
              ? args.childProfileInput.childId
              : undefined,
          childName:
            'childName' in args.childProfileInput
              ? args.childProfileInput.childName
              : childProfile!.name,
          voicePresetId:
            'voicePresetId' in args.voicePresetInput
              ? args.voicePresetInput.voicePresetId
              : undefined,
          voiceName:
            'voiceName' in args.voicePresetInput
              ? args.voicePresetInput.voiceName
              : voicePreset!.name,
          voiceDescription:
            'voiceDescription' in args.voicePresetInput
              ? args.voicePresetInput.voiceDescription
              : undefined,
        }
      )

      if (!storyId) {
        throw new ConvexError('Failed to save story')
      }

      return storyId
    } catch (error) {
      throw new ConvexError(
        `Failed to save story: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  },
})

/**
 * Generate voice for a story
 */
export const generateStoryVoice = action({
  args: {
    storyId: v.id('stories'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    // Get Hume API key
    const humeApiKey: string | null = await ctx.runAction(
      api.users.actions.getHumeApiKey
    )

    if (!humeApiKey) {
      throw new ConvexError(
        'Hume API key not found. Please add your API key in settings.'
      )
    }

    const story: Doc<'stories'> | null = await ctx.runQuery(
      api.stories.queries.getStoryById,
      { storyId: args.storyId }
    )

    if (!story) {
      throw new ConvexError('Story not found')
    }

    // Update status to generating
    await ctx.runMutation(internal.stories.mutations.updateStoryAudioStatus, {
      storyId: args.storyId,
      audioStatus: 'generating',
    })

    // Initialize Hume client
    const hume: HumeClient = new HumeClient({
      apiKey: humeApiKey,
    })

    try {
      let voiceResponse

      // If using a saved voice preset
      if (story.voicePresetId) {
        const [voicePresetError, voicePreset] = await handlePromise(
          ctx.runQuery(api.voicePresets.queries.getVoicePresetById, {
            presetId: story.voicePresetId,
          })
        )

        if (voicePresetError || !voicePreset) {
          throw new ConvexError(
            `Voice preset not found: ${voicePresetError ? voicePresetError.message : 'Unknown error'}`
          )
        }

        // Use the saved voice ID
        const [savedVoiceError, savedVoiceResponse] = await handlePromise(
          hume.tts.synthesizeJson(
            {
              utterances: [
                {
                  voice: { id: voicePreset.humeVoiceId },
                  text: story.content,
                },
              ],
            },
            {
              // 5 minutes
              timeoutInSeconds: 300,
            }
          )
        )

        if (savedVoiceError) {
          if (savedVoiceError instanceof HumeError) {
            console.error(
              `Hume Error: ${savedVoiceError.statusCode} - ${savedVoiceError.message}`
            )
            console.error(savedVoiceError.body)
          } else if (savedVoiceError instanceof HumeTimeoutError) {
            console.error('Hume timeout error:', savedVoiceError)
          } else {
            console.error('Unknown Error:', savedVoiceError)
          }

          throw new ConvexError(
            `Failed to generate audio when using saved voice preset.`
          )
        }

        voiceResponse = savedVoiceResponse as ReturnTts
      }
      // Otherwise use the voice description
      // This is stored on the story itself - what they manually typed in
      else if (story.voiceDescription) {
        const [voiceDescriptionError, voiceDescriptionResponse] =
          await handlePromise(
            hume.tts.synthesizeJson(
              {
                utterances: [
                  {
                    description: story.voiceDescription,
                    text: story.content,
                  },
                ],
              },
              {
                // 5 minutes
                timeoutInSeconds: 300,
              }
            )
          )

        if (voiceDescriptionError) {
          throw new ConvexError(
            `Failed to generate audio when using manually typed in voice description.`
          )
        }

        voiceResponse = voiceDescriptionResponse as ReturnTts
      }
      // Fallback to a generic storyteller voice
      // this should never happen actually
      // because they either have to have a preset or manually type in a voice description
      else {
        voiceResponse = await hume.tts.synthesizeJson({
          utterances: [
            {
              description:
                "A gentle, engaging storyteller perfect for children's bedtime stories",
              text: story.content,
            },
          ],
        })
      }

      // Store audio in Convex
      const audioBase64 = voiceResponse.generations[0].audio
      const audioBuffer = Buffer.from(audioBase64, 'base64')
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' })

      const [storageError, storageId] = await handlePromise(
        ctx.storage.store(audioBlob)
      )

      if (storageError || !storageId) {
        throw new ConvexError(
          `Failed to store audio: ${storageError ? storageError.message : 'Unknown error'}`
        )
      }

      // Update story with audio
      await ctx.runMutation(internal.stories.mutations.updateStoryAudioStatus, {
        storyId: args.storyId,
        audioStatus: 'ready',
        audioStorageId: storageId,
      })

      return storageId
    } catch (error) {
      // Update status to error
      await ctx.runMutation(internal.stories.mutations.updateStoryAudioStatus, {
        storyId: args.storyId,
        audioStatus: 'error',
      })

      throw new ConvexError(`Failed to generate audio: ${String(error)}`)
    }
  },
})
