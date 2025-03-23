import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { query } from '../_generated/server'

/**
 * Get all voice presets for current user
 */
export const getVoicePresets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    const presets = await ctx.db
      .query('voicePresets')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()

    // Add audio URLs to each preset
    return await Promise.all(
      presets.map(async (preset) => ({
        ...preset,
        sampleAudioUrl: await ctx.storage.getUrl(preset.sampleAudioId),
      }))
    )
  },
})

/**
 * Get a specific voice preset by ID
 */
export const getVoicePreset = query({
  args: {
    presetId: v.id('voicePresets'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const preset = await ctx.db.get(args.presetId)

    // Ensure user owns this preset
    if (!preset || preset.userId !== userId) {
      return null
    }

    return {
      ...preset,
      sampleAudioUrl: await ctx.storage.getUrl(preset.sampleAudioId),
    }
  },
})
