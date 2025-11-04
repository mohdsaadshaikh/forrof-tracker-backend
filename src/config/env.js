import { config as loadEnv } from 'dotenv'
import { z } from 'zod'

loadEnv()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z
    .string()
    .regex(/^\d+$/, 'SMTP_PORT must be a number')
    .transform(Number)
    .refine(v => v > 0 && v < 65536, {
      message: 'SMTP_PORT must be a valid port number',
    }),

  SMTP_USERNAME: z.string().min(1, 'SMTP_USERNAME is required'),
  SMTP_PASSWORD: z.string().min(1, 'SMTP_PASSWORD is required'),

  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email address'),
})

export const ENV = envSchema.parse(process.env)
