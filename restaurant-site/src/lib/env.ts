/**
 * Environment Configuration Utility
 * Centralized management of environment variables with validation and type safety
 */

import { z } from 'zod'

// Environment schema validation
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),

  // Database
  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_SIZE: z.coerce.number().default(20),
  DATABASE_TIMEOUT: z.coerce.number().default(30000),

  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  SESSION_MAX_AGE: z.coerce.number().default(86400),

  // Authentication providers (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default('restaurant-images'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_TO_ADMIN: z.string().email().optional(),

  // External services
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  GTM_ID: z.string().optional(),

  // Security
  RATE_LIMIT_WINDOW: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  CSRF_SECRET: z.string().optional(),

  // Feature flags
  ENABLE_REGISTRATION: z.coerce.boolean().default(true),
  ENABLE_EMAIL_NOTIFICATIONS: z.coerce.boolean().default(true),
  ENABLE_GOOGLE_SIGNIN: z.coerce.boolean().default(false),
  ENABLE_ANALYTICS: z.coerce.boolean().default(false),
  ENABLE_MAINTENANCE_MODE: z.coerce.boolean().default(false),

  // Logging and monitoring
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
  SENTRY_DSN: z.string().optional(),

  // Redis (optional)
  REDIS_URL: z.string().optional(),
  REDIS_TTL: z.coerce.number().default(3600),

  // Restaurant information
  RESTAURANT_NAME: z.string().default('Restaurant'),
  RESTAURANT_PHONE: z.string().optional(),
  RESTAURANT_EMAIL: z.string().email().optional(),
  RESTAURANT_ADDRESS: z.string().optional(),
  BUSINESS_HOURS: z.string().optional(),
  INSTAGRAM_URL: z.string().url().optional(),
  FACEBOOK_URL: z.string().url().optional(),
  TELEGRAM_URL: z.string().url().optional(),

  // Development
  NEXT_TELEMETRY_DISABLED: z.coerce.boolean().default(true),
  FAST_REFRESH: z.coerce.boolean().default(true),
  USE_MOCK_DATA: z.coerce.boolean().default(false),
  SKIP_EMAIL_VERIFICATION: z.coerce.boolean().default(false),
})

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter(err => err.code === 'invalid_type' && err.received === 'undefined')
        .map(err => err.path.join('.'))
      
      const invalidVars = error.errors
        .filter(err => err.code !== 'invalid_type' || err.received !== 'undefined')
        .map(err => `${err.path.join('.')}: ${err.message}`)

      let errorMessage = 'Environment validation failed:\n'
      
      if (missingVars.length > 0) {
        errorMessage += `Missing required variables: ${missingVars.join(', ')}\n`
      }
      
      if (invalidVars.length > 0) {
        errorMessage += `Invalid variables:\n${invalidVars.join('\n')}`
      }
      
      throw new Error(errorMessage)
    }
    throw error
  }
}

// Export validated environment configuration
export const env = parseEnv()

// Environment-specific configurations
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Database configuration
export const dbConfig = {
  url: env.DATABASE_URL,
  poolSize: env.DATABASE_POOL_SIZE,
  timeout: env.DATABASE_TIMEOUT,
}

// Authentication configuration
export const authConfig = {
  url: env.NEXTAUTH_URL,
  secret: env.NEXTAUTH_SECRET,
  sessionMaxAge: env.SESSION_MAX_AGE,
  providers: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      enabled: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    },
  },
}

// Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: env.CLOUDINARY_CLOUD_NAME,
  apiKey: env.CLOUDINARY_API_KEY,
  apiSecret: env.CLOUDINARY_API_SECRET,
  folder: env.CLOUDINARY_FOLDER,
  enabled: !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET),
}

// Email configuration
export const emailConfig = {
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER && env.SMTP_PASSWORD ? {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    } : undefined,
  },
  from: env.EMAIL_FROM,
  toAdmin: env.EMAIL_TO_ADMIN,
  enabled: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD),
}

// Feature flags
export const features = {
  registration: env.ENABLE_REGISTRATION,
  emailNotifications: env.ENABLE_EMAIL_NOTIFICATIONS,
  googleSignin: env.ENABLE_GOOGLE_SIGNIN,
  analytics: env.ENABLE_ANALYTICS,
  maintenanceMode: env.ENABLE_MAINTENANCE_MODE,
}

// Restaurant information
export const restaurantInfo = {
  name: env.RESTAURANT_NAME,
  phone: env.RESTAURANT_PHONE,
  email: env.RESTAURANT_EMAIL,
  address: env.RESTAURANT_ADDRESS,
  businessHours: env.BUSINESS_HOURS ? JSON.parse(env.BUSINESS_HOURS) : {},
  socialMedia: {
    instagram: env.INSTAGRAM_URL,
    facebook: env.FACEBOOK_URL,
    telegram: env.TELEGRAM_URL,
  },
}

// Utility functions
export const getEnvVar = (key: keyof typeof env, fallback?: string): string => {
  const value = env[key]
  if (value === undefined || value === '') {
    if (fallback !== undefined) return fallback
    throw new Error(`Environment variable ${key} is required but not set`)
  }
  return String(value)
}

export const isEnvVarSet = (key: keyof typeof env): boolean => {
  const value = env[key]
  return value !== undefined && value !== ''
}

// Export type for TypeScript
export type Environment = typeof env