'use node'

import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError, v } from 'convex/values'
import { HumeClient } from 'hume'
import { z } from 'zod'
import { api, internal } from '../_generated/api'
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

    if (speechError || !speech) {
      throw new ConvexError(`Failed to generate voice: ${speechError?.message}`)
    }

    // Get voice ID from generation
    const generationId = speech.generations[0].generationId

    // Save voice to Hume library for reuse
    const [saveError, saveResponse] = await handlePromise(
      hume.tts.voices.create({
        name: args.name,
        generationId,
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

    const humeVoiceId = saveResponse?.id

    if (!humeVoiceId) {
      throw new ConvexError('Failed to save voice to Hume.')
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
        humeVoiceId,
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

export const deleteVoicePreset = action({
  args: {
    presetId: v.id('voicePresets'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    const preset = await ctx.runQuery(
      api.voicePresets.queries.getVoicePresetById,
      {
        presetId: args.presetId,
      }
    )

    if (!preset) {
      throw new ConvexError('Voice preset not found')
    }

    if (preset.userId !== userId) {
      throw new ConvexError('Not authorized to delete this preset')
    }

    const humeAiApiKey = await ctx.runAction(api.users.actions.getHumeApiKey)

    if (!humeAiApiKey) {
      throw new ConvexError('Hume API key not found')
    }

    const [humeDeleteError, humeDeleteResponse] = await handlePromise(
      fetch(`https://api.hume.ai/v0/evi/custom_voices/${preset.humeVoiceId}`, {
        method: 'DELETE',
        headers: {
          'X-Hume-Api-Key': humeAiApiKey,
        },
      })
    )

    // The reason we only log errors here is because we still wanna
    // let users delete the preset even if the voice is not found in Hume for some reason
    if (humeDeleteError) {
      console.log('humeDeleteError', humeDeleteError)
    }

    if (!humeDeleteResponse!.ok) {
      console.log('humeDeleteResponse', humeDeleteResponse)
    }

    // First delete the stored audio file
    const [deleteFileFromStorageError] = await handlePromise(
      ctx.storage.delete(preset.sampleAudioId)
    )

    if (deleteFileFromStorageError) {
      throw new ConvexError(`Failed to delete file from storage`)
    }

    const [deletePresetError] = await handlePromise(
      ctx.runMutation(internal.voicePresets.mutations.deleteVoicePreset, {
        presetId: args.presetId,
      })
    )

    if (deletePresetError) {
      throw new ConvexError(`Failed to delete preset`)
    }

    return true
  },
})
