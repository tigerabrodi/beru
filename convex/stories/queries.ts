import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { query } from '../_generated/server'

/**
 * Get all stories for current user
 */
export const getAllStoriesForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    const stories = await ctx.db
      .query('stories')
      .withIndex('by_userId_createdAt', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()

    return stories
  },
})

/**
 * Get favorite stories for current user
 */
export const getFavoriteStories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    const stories = await ctx.db
      .query('stories')
      .withIndex('by_userId_favorite', (q) =>
        q.eq('userId', userId).eq('isFavorite', true)
      )
      .order('desc')
      .collect()

    // Add audio URLs to stories that have audio
    return await Promise.all(
      stories.map(async (story) => ({
        ...story,
        audioUrl: story.audioStorageId
          ? await ctx.storage.getUrl(story.audioStorageId)
          : null,
      }))
    )
  },
})

/**
 * Get a specific story by ID
 */
export const getStory = query({
  args: {
    storyId: v.id('stories'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const story = await ctx.db.get(args.storyId)

    // Ensure user owns this story
    if (!story || story.userId !== userId) {
      return null
    }

    // Add audio URL if available
    return {
      ...story,
      audioUrl: story.audioStorageId
        ? await ctx.storage.getUrl(story.audioStorageId)
        : null,
    }
  },
})

/**
 * Get stories for a specific child
 */
export const getStoriesByChild = query({
  args: {
    childId: v.id('childProfiles'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    // First verify child profile belongs to user
    const childProfile = await ctx.db.get(args.childId)
    if (!childProfile || childProfile.userId !== userId) {
      return []
    }

    const stories = await ctx.db
      .query('stories')
      .withIndex('by_childId', (q) => q.eq('childId', args.childId))
      .order('desc')
      .collect()

    // Add audio URLs to stories that have audio
    return await Promise.all(
      stories.map(async (story) => ({
        ...story,
        audioUrl: story.audioStorageId
          ? await ctx.storage.getUrl(story.audioStorageId)
          : null,
      }))
    )
  },
})
