import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url().default('https://todo-full-stack-web-app-phase-ii.vercel.app'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('https://helloworlds665-todo-full-stack-web-app.hf.space'),
  NEXT_PUBLIC_JWT_TOKEN_KEY: z.string().default('auth_token'),
  NEXT_PUBLIC_REFRESH_TOKEN_KEY: z.string().default('refresh_token'),
});

// Validate environment variables
const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Invalid environment variables:', env.error.flatten().fieldErrors);

  // Use fallback values for development
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL = 'https://todo-full-stack-web-app-phase-ii.vercel.app';
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://helloworlds665-todo-full-stack-web-app.hf.space';
  process.env.NEXT_PUBLIC_JWT_TOKEN_KEY = 'auth_token';
  process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY = 'refresh_token';
}

export const authConfig = {
  // Base URLs
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://helloworlds665-todo-full-stack-web-app.hf.space',
  authUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'https://todo-full-stack-web-app-phase-ii.vercel.app',

  // Token storage keys
  tokenKey: process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'auth_token',
  refreshTokenKey: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refresh_token',

  // Token expiration (in seconds) - defaults to 1 hour for access token
  accessTokenExpiration: 3600,

  // Refresh token expiration (in seconds) - defaults to 7 days
  refreshTokenExpiration: 7 * 24 * 3600,

  // Default API timeout
  apiTimeout: 10000, // 10 seconds

  // Error messages
  defaultErrorMessage: 'An unexpected error occurred',
  unauthorizedMessage: 'Authentication required',
  forbiddenMessage: 'Access forbidden',

  // Validation rules
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  passwordMinLength: 8,
  passwordRules: [
    'At least 8 characters long',
    'Contains uppercase letter',
    'Contains lowercase letter',
    'Contains number',
    'Contains special character'
  ]
};