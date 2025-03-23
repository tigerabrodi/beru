'use node'

import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError, v } from 'convex/values'
import { HumeClient } from 'hume'
import { z } from 'zod'
import { api } from '../_generated/api'
import { Id } from '../_generated/dataModel'
import { action } from '../_generated/server'
import { handlePromise } from '../lib/utils'

const HUME_CLIENT_ERROR_SLUG = 'client_error'

const HUME_UNIQUE_NAME_ERROR_CODE = 'E0603'

const humeErrorBodySchema = z.object({
  details: z.object({
    type: z.string(),
    message: z.string(),
    code: z.string(),
    slug: z.string(),
  }),
})

/**
 * Generate and save a new voice preset
 */
export const generateVoicePreset = action({
  args: {
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args): Promise<Id<'voicePresets'>> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    // Get Hume API key
    const [keyError, humeApiKey] = await handlePromise(
      ctx.runAction(api.users.actions.getHumeApiKey)
    )

    if (keyError || !humeApiKey) {
      throw new ConvexError(
        'Hume API key not found. Please add your API key in settings.'
      )
    }

    // Initialize Hume client
    const hume = new HumeClient({
      apiKey: humeApiKey,
    })

    // Generate sample voice with description
    const [speechError, speech] = await handlePromise(
      hume.tts.synthesizeJson({
        utterances: [
          {
            description: args.description,
            text: 'Once upon a time, in a magical forest, there lived a group of friendly animals. They all worked together to protect their home and had wonderful adventures every day.',
          },
        ],
      })
    )

    console.log('speechError', speechError)

    if (speechError || !speech) {
      throw new ConvexError(`Failed to generate voice: ${speechError?.message}`)
    }

    // Get voice ID from generation
    const humeVoiceId = speech.generations[0].generationId

    // Save voice to Hume library for reuse
    const [saveError] = await handlePromise(
      hume.tts.voices.create({
        name: args.name,
        generationId: humeVoiceId,
      })
    )

    if (saveError) {
      // this is honestly just to satisfy typescript
      const parsedError = humeErrorBodySchema.safeParse(
        'body' in saveError ? saveError.body : {}
      )

      if (parsedError.success) {
        const bodyError = parsedError.data.details

        const isUniqueNameError =
          bodyError.code === HUME_UNIQUE_NAME_ERROR_CODE &&
          bodyError.slug === HUME_CLIENT_ERROR_SLUG

        if (isUniqueNameError) {
          throw new ConvexError(
            `Voice preset with name ${args.name} already exists in Hume. Names in hume must be unique. To fix this, go to my voices in Hume if you want to remove it.`
          )
        }
      }

      throw new ConvexError(`Failed to save voice to Hume.`)
    }

    // Store sample audio in Convex
    const audioBase64 = speech.generations[0].audio
    const audioBuffer = Buffer.from(audioBase64, 'base64')
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' })

    const [storageError, storageId] = await handlePromise(
      ctx.storage.store(audioBlob)
    )

    if (storageError || !storageId) {
      throw new ConvexError(
        `Failed to store audio sample: ${storageError?.message}`
      )
    }

    // Create voice preset in database
    const [presetError, presetId] = await handlePromise(
      ctx.runMutation(api.voicePresets.mutations.createVoicePreset, {
        name: args.name,
        description: args.description,
        humeVoiceId: humeVoiceId,
        sampleAudioId: storageId,
      })
    )

    if (presetError || !presetId) {
      throw new ConvexError(
        `Failed to save voice preset: ${presetError ? presetError.message : 'Unknown error'}`
      )
    }

    return presetId
  },
})
