import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { query } from '../_generated/server'

/**
 * Get all child profiles for current user
 */
export const getChildProfiles = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    return await ctx.db
      .query('childProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()
  },
})

/**
 * Get a specific child profile by ID
 */
export const getChildProfile = query({
  args: {
    childId: v.id('childProfiles'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const profile = await ctx.db.get(args.childId)

    // Ensure user owns this profile
    if (!profile || profile.userId !== userId) {
      return null
    }

    return profile
  },
})
