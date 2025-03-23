import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError, v } from 'convex/values'
import { Doc } from '../_generated/dataModel'
import { internalMutation, mutation } from '../_generated/server'
import { getCurrentTimestamp } from '../lib/utils'
import { StoriesTable } from '../schema'

/**
 * Create a new story
 */
export const createStory = internalMutation({
  args: {
    title: v.string(),
    content: v.string(),
    childId: v.optional(v.id('childProfiles')),
    childName: v.string(),
    voicePresetId: v.optional(v.id('voicePresets')),
    voiceName: v.string(),
    voiceDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    // If childId is provided, verify it belongs to user
    if (args.childId) {
      const childProfile = await ctx.db.get(args.childId)
      if (!childProfile || childProfile.userId !== userId) {
        throw new ConvexError('Invalid child profile')
      }
    }

    // If voicePresetId is provided, verify it belongs to user
    if (args.voicePresetId) {
      const voicePreset = await ctx.db.get(args.voicePresetId)
      if (!voicePreset || voicePreset.userId !== userId) {
        throw new ConvexError('Invalid voice preset')
      }
    }

    return await ctx.db.insert('stories', {
      userId,
      title: args.title,
      content: args.content,
      childId: args.childId,
      childName: args.childName,
      voicePresetId: args.voicePresetId,
      voiceName: args.voiceName,
      voiceDescription: args.voiceDescription,
      audioStatus: 'pending',
      createdAt: getCurrentTimestamp(),
      isFavorite: false,
    })
  },
})

/**
 * Toggle favorite status for a story
 */
export const toggleFavorite = mutation({
  args: {
    storyId: v.id('stories'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    const story = await ctx.db.get(args.storyId)

    // Verify story exists and belongs to user
    if (!story) {
      throw new ConvexError('Story not found')
    }

    if (story.userId !== userId) {
      throw new ConvexError('Not authorized to modify this story')
    }

    // Toggle favorite status
    await ctx.db.patch(args.storyId, {
      isFavorite: !story.isFavorite,
    })

    return args.storyId
  },
})

/**
 * Update audio status for a story
 */
export const updateStoryAudioStatus = internalMutation({
  args: {
    storyId: v.id('stories'),
    audioStatus: StoriesTable.validator.fields.audioStatus,
    audioStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    const story = await ctx.db.get(args.storyId)

    // Verify story exists and belongs to user
    if (!story) {
      throw new ConvexError('Story not found')
    }

    if (story.userId !== userId) {
      throw new ConvexError('Not authorized to modify this story')
    }

    // Update audio status
    const updateData: Partial<Doc<'stories'>> = {
      audioStatus: args.audioStatus,
    }

    if (args.audioStorageId) {
      updateData.audioStorageId = args.audioStorageId
    }

    await ctx.db.patch(args.storyId, updateData)
    return args.storyId
  },
})
