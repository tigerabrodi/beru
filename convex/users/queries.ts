import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { internalQuery, query } from '../_generated/server'

/**
 * Get current authenticated user
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) {
      return null
    }
    return await ctx.db.get(userId)
  },
})

/**
 * Get user by email
 */
export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()
  },
})

/**
 * Get user by ID (internal use only)
 */
export const getUserById = internalQuery({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId)
  },
})

/**
 * Check if user has stored API keys
 */
export const getApiKeyStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) {
      return { openai: false, hume: false }
    }
    const user = await ctx.db.get(userId)
    if (!user) {
      return { openai: false, hume: false }
    }
    return {
      openai: !!user.openaiApi,
      hume: !!user.humeApi,
    }
  },
})
