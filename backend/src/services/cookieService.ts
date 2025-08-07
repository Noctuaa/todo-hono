import type { Context } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'

/**
 * Authentication cookie names and their purposes
 * - AUTH_SESSION: JWT access token (short-lived, 5-15 minutes)
 * - USR_TOKEN: Refresh token (long-lived, days/weeks)
 * - APP_ID: Session identifier for Redis lookup
 */
export const COOKIE_NAMES = {
  AUTH_SESSION: 'auth_session', // Access
  USR_TOKEN: 'usr_token', // Refresh
  APP_ID: 'app_id' // Session
} as const


/**
 * Default security options applied to all authentication cookies
 * - httpOnly: Prevents XSS attacks by blocking JavaScript access
 * - secure: HTTPS only in production
 * - sameSite: Prevents CSRF attacks
 */
const DEFAULT_OPTIONS = {
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   sameSite: 'Strict' as const
}

/**
 * Sets the access token cookie containing JWT
 * Short-lived token for API authentication (typically 5-15 minutes)
 * @param {Context} c - Hono Context
 * @param {string} token - The JWT access token to store
 */
export const setAccessToken = (c: Context, token: string) => {
   setCookie(c, COOKIE_NAMES.AUTH_SESSION, token,{
      ...DEFAULT_OPTIONS,
      maxAge: parseInt(process.env.JWT_ACCESS_EXPIRY ?? '900')
   })
}

/**
 * Sets the refresh token cookie
 * Duration varies based on "remember me" option for user convenience
 * @param {Context} c - Hono Context
 * @param {string} token - The refresh token to store
 * @param {boolean} isRememberMe - If true, extends cookie lifetime significantly
 */
export const setRefreshToken = (c: Context, token: string, isRememberMe: boolean ) => {
   const maxAge = isRememberMe ? 
      parseInt(process.env.JWT_REFRESH_EXPIRY_LONG!) :
      parseInt(process.env.JWT_REFRESH_EXPIRY_SHORT!)

   setCookie(c, COOKIE_NAMES.USR_TOKEN, token, {
      ...DEFAULT_OPTIONS,
      maxAge
   })
}

/**
 * Sets the session ID cookie for Redis session lookup
 * Links client requests to server-side session data
 * @param {Context} c - Hono Context
 * @param {string} token - The session identifier UUID
 * @param {boolean} isRememberMe - If true, matches refresh token duration
 */
export const setAppSessionId = (c: Context, token: string, isRememberMe:boolean ) => {
   const maxAge = isRememberMe ? 
      parseInt(process.env.REDIS_SESSION_EXPIRY_LONG!) :
      parseInt(process.env.REDIS_SESSION_EXPIRY_SHORT!)

   setCookie(c, COOKIE_NAMES.APP_ID, token, {
      ...DEFAULT_OPTIONS,
      maxAge
   })
}

/**
 * Clears all authentication cookies
 * Used during logout or when authentication fails
 * @param {Context} c - Hono Context
 */
export const clearAuthCookies = (c: Context) => {
  deleteCookie(c, COOKIE_NAMES.AUTH_SESSION)
  deleteCookie(c, COOKIE_NAMES.USR_TOKEN)
  deleteCookie(c, COOKIE_NAMES.APP_ID)
}