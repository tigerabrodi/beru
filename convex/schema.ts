import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const StoriesTable = defineTable({
  userId: v.id('users'), // Reference to the user who created this story
  childId: v.optional(v.id('childProfiles')), // Reference to child profile (optional for manual entry)
  childName: v.string(), // Child's name (for display purposes)
  title: v.string(), // Story title
  content: v.string(), // Full story content
  voicePresetId: v.optional(v.id('voicePresets')), // Reference to voice preset (optional for manual entry)
  voiceName: v.string(), // Voice name (for display purposes)
  voiceDescription: v.optional(v.string()), // Voice description if manually entered
  audioStorageId: v.optional(v.id('_storage')), // Reference to stored audio file
  audioStatus: v.union(
    v.literal('pending'),
    v.literal('generating'),
    v.literal('ready'),
    v.literal('error')
  ), // Status of audio generation
  createdAt: v.number(), // When the story was created
  isFavorite: v.boolean(), // Whether story is favorited
})

// Define the schema for the application
export default defineSchema({
  // Include Convex Auth tables
  ...authTables,

  // Users table (extends the auth user)
  users: defineTable({
    email: v.string(),
    updatedAt: v.number(),
    openaiApi: v.optional(
      v.object({
        encryptedKey: v.array(v.number()), // For encrypted OpenAI API key storage
        initializationVector: v.array(v.number()), // IV for encryption
      })
    ),
    humeApi: v.optional(
      v.object({
        encryptedKey: v.array(v.number()), // For encrypted Hume.ai API key storage
        initializationVector: v.array(v.number()), // IV for encryption
      })
    ),
  }).index('by_email', ['email']),

  // Child Profiles table
  childProfiles: defineTable({
    userId: v.id('users'), // Reference to the user who created this profile
    name: v.string(), // Child's name
    age: v.number(), // Child's age
    interests: v.string(), // Comma-separated list of interests
    createdAt: v.number(), // When the profile was created
  })
    .index('by_userId', ['userId'])
    .index('by_createdAt', ['createdAt']),

  // Voice Presets table
  voicePresets: defineTable({
    userId: v.id('users'), // Reference to the user who created this preset
    name: v.string(), // Voice preset name
    description: v.string(), // Voice description
    humeVoiceId: v.string(), // Stored voice ID from Hume.ai (required)
    sampleAudioId: v.id('_storage'), // Storage ID for sample audio (required)
    createdAt: v.number(), // When the preset was created
  })
    .index('by_userId', ['userId'])
    .index('by_createdAt', ['createdAt']),

  // Stories table
  stories: StoriesTable.index('by_userId', ['userId'])
    .index('by_userId_favorite', ['userId', 'isFavorite']) // For filtering favorites
    .index('by_userId_createdAt', ['userId', 'createdAt']) // For sorting user's stories by date
    .index('by_childId', ['childId'])
    .index('by_createdAt', ['createdAt']),
})
