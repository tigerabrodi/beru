import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError, v } from 'convex/values'
import { Doc } from '../_generated/dataModel'
import { mutation } from '../_generated/server'
import { getCurrentTimestamp } from '../lib/utils'

/**
 * Create a new child profile
 */
export const createChildProfile = mutation({
  args: {
    name: v.string(),
    age: v.number(),
    interests: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    return await ctx.db.insert('childProfiles', {
      userId,
      name: args.name,
      age: args.age,
      interests: args.interests,
      createdAt: getCurrentTimestamp(),
    })
  },
})

/**
 * Update an existing child profile
 */
export const updateChildProfile = mutation({
  args: {
    childId: v.id('childProfiles'),
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    interests: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    const profile = await ctx.db.get(args.childId)

    // Verify profile exists and belongs to user
    if (!profile) {
      throw new ConvexError('Child profile not found')
    }

    if (profile.userId !== userId) {
      throw new ConvexError('Not authorized to update this profile')
    }

    // Build update object with only defined fields
    const updateData: Partial<Doc<'childProfiles'>> = {}
    if (args.name !== undefined) updateData.name = args.name
    if (args.age !== undefined) updateData.age = args.age
    if (args.interests !== undefined) updateData.interests = args.interests

    await ctx.db.patch(args.childId, updateData)
    return args.childId
  },
})

/**
 * Delete a child profile
 */
export const deleteChildProfile = mutation({
  args: {
    childId: v.id('childProfiles'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    const profile = await ctx.db.get(args.childId)

    // Verify profile exists and belongs to user
    if (!profile) {
      throw new ConvexError('Child profile not found')
    }

    if (profile.userId !== userId) {
      throw new ConvexError('Not authorized to delete this profile')
    }

    await ctx.db.delete(args.childId)
    return true
  },
})
