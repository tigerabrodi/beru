import { ConvexError, v } from 'convex/values'
import { mutation } from '../_generated/server'
import { getCurrentTimestamp } from '../lib/utils'

/**
 * Update user data (for internal use)
 */
export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    data: v.object({
      email: v.optional(v.string()),
      openaiApi: v.optional(
        v.object({
          encryptedKey: v.array(v.number()),
          initializationVector: v.array(v.number()),
        })
      ),
      humeApi: v.optional(
        v.object({
          encryptedKey: v.array(v.number()),
          initializationVector: v.array(v.number()),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new ConvexError('User not found')
    }

    await ctx.db.patch(args.userId, {
      ...args.data,
      updatedAt: getCurrentTimestamp(),
    })

    return args.userId
  },
})
