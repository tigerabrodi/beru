import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError, v } from 'convex/values'
import { Doc } from '../_generated/dataModel'
import { internalMutation, mutation } from '../_generated/server'
import { getCurrentTimestamp } from '../lib/utils'

/**
 * Create a new voice preset
 * Note: Actual voice generation happens in actions.ts
 */
export const createVoicePreset = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    humeVoiceId: v.string(),
    sampleAudioId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    return await ctx.db.insert('voicePresets', {
      userId,
      name: args.name,
      description: args.description,
      humeVoiceId: args.humeVoiceId,
      sampleAudioId: args.sampleAudioId,
      createdAt: getCurrentTimestamp(),
    })
  },
})

/**
 * Update a voice preset
 */
export const updateVoicePreset = mutation({
  args: {
    presetId: v.id('voicePresets'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    const preset = await ctx.db.get(args.presetId)

    // Verify preset exists and belongs to user
    if (!preset) {
      throw new ConvexError('Voice preset not found')
    }

    if (preset.userId !== userId) {
      throw new ConvexError('Not authorized to update this preset')
    }

    // Build update object with only defined fields
    const updateData: Partial<Doc<'voicePresets'>> = {}
    if (args.name !== undefined) updateData.name = args.name
    if (args.description !== undefined)
      updateData.description = args.description

    await ctx.db.patch(args.presetId, updateData)
    return args.presetId
  },
})

/**
 * Delete a voice preset
 */
export const deleteVoicePreset = internalMutation({
  args: {
    presetId: v.id('voicePresets'),
  },
  handler: async (ctx, args) => {
    // Then delete the preset record
    await ctx.db.delete(args.presetId)
    return true
  },
})
