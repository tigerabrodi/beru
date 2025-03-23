'use node'

import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError, v } from 'convex/values'
import crypto from 'crypto'
import { api, internal } from '../_generated/api'
import { Doc } from '../_generated/dataModel'
import { action } from '../_generated/server'
import { handlePromise } from '../lib/utils'

const ALGORITHM = { name: 'AES-GCM', length: 256 }

/**
 * Get encryption key from environment variable
 */
async function getEncryptionKey() {
  const encoder = new TextEncoder()
  const keyMaterial = encoder.encode(process.env.CONVEX_ENCRYPTION_SECRET)
  const hash = await crypto.subtle.digest('SHA-256', keyMaterial)

  return await crypto.subtle.importKey('raw', hash, ALGORITHM, false, [
    'encrypt',
    'decrypt',
  ])
}

/**
 * Store OpenAI API key for current user
 */
export const storeOpenAiApiKey = action({
  args: { apiKey: v.string() },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    const [keyError, key] = await handlePromise(getEncryptionKey())
    if (keyError) {
      throw new ConvexError('Failed to get encryption key')
    }

    if (!key) {
      throw new ConvexError('Failed to get encryption key')
    }

    const initializationVector = crypto.getRandomValues(new Uint8Array(12))

    const [encryptionError, encrypted] = await handlePromise(
      crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: initializationVector },
        key,
        new TextEncoder().encode(args.apiKey)
      )
    )

    if (encryptionError) {
      throw new ConvexError('Failed to encrypt API key')
    }

    if (!encrypted) {
      throw new ConvexError('Failed to encrypt API key')
    }

    await ctx.runMutation(api.users.mutations.updateUser, {
      userId: userId,
      data: {
        openaiApi: {
          encryptedKey: Array.from(new Uint8Array(encrypted)),
          initializationVector: Array.from(initializationVector),
        },
      },
    })

    return true
  },
})

/**
 * Store Hume API key for current user
 */
export const storeHumeApiKey = action({
  args: { apiKey: v.string() },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('User not authenticated')
    }

    const [keyError, key] = await handlePromise(getEncryptionKey())

    if (keyError) {
      throw new ConvexError('Failed to get encryption key')
    }

    if (!key) {
      throw new ConvexError('Failed to get encryption key')
    }

    const initializationVector = crypto.getRandomValues(new Uint8Array(12))

    const [encryptionError, encrypted] = await handlePromise(
      crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: initializationVector },
        key,
        new TextEncoder().encode(args.apiKey)
      )
    )

    if (encryptionError) {
      throw new ConvexError('Failed to encrypt API key')
    }

    if (!encrypted) {
      throw new ConvexError('Failed to encrypt API key')
    }

    await ctx.runMutation(api.users.mutations.updateUser, {
      userId: userId,
      data: {
        humeApi: {
          encryptedKey: Array.from(new Uint8Array(encrypted)),
          initializationVector: Array.from(initializationVector),
        },
      },
    })

    return true
  },
})

/**
 * Get OpenAI API key for current user
 */
export const getOpenAiApiKey = action({
  async handler(ctx) {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const user = (await ctx.runQuery(internal.users.queries.getUserById, {
      userId,
    })) as Doc<'users'>

    if (!user || !user.openaiApi) {
      return null
    }

    const [keyError, key] = await handlePromise(getEncryptionKey())

    if (keyError) {
      throw new ConvexError('Failed to get encryption key')
    }

    if (!key) {
      throw new ConvexError('Failed to get encryption key')
    }

    const [decryptionError, decrypted] = await handlePromise(
      crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(user.openaiApi.initializationVector),
        },
        key,
        new Uint8Array(user.openaiApi.encryptedKey)
      )
    )

    if (decryptionError || !decrypted) {
      throw new ConvexError('Failed to decrypt API key')
    }

    return new TextDecoder().decode(decrypted)
  },
})

/**
 * Get Hume API key for current user
 */
export const getHumeApiKey = action({
  async handler(ctx) {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const user = (await ctx.runQuery(internal.users.queries.getUserById, {
      userId,
    })) as Doc<'users'>

    if (!user || !user.humeApi) {
      return null
    }

    const [keyError, key] = await handlePromise(getEncryptionKey())

    if (keyError) {
      throw new ConvexError('Failed to get encryption key')
    }

    if (!key) {
      throw new ConvexError('Failed to get encryption key')
    }

    const [decryptionError, decrypted] = await handlePromise(
      crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(user.humeApi.initializationVector),
        },
        key,
        new Uint8Array(user.humeApi.encryptedKey)
      )
    )

    if (decryptionError || !decrypted) {
      throw new ConvexError('Failed to decrypt API key')
    }

    return new TextDecoder().decode(decrypted)
  },
})
