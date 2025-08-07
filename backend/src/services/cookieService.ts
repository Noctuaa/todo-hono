import type { Context } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'

/**
 * Cookie Name
 * - AUTH_SESSION = Access
 * - USR_TOKEN = Refresh
 * - APP_ID = Session
 */
export const COOKIE_NAMES = {
  AUTH_SESSION: 'auth_session', // Access
  USR_TOKEN: 'usr_token', // Refresh
  APP_ID: 'app_id' // Session
} as const


// === Default options for all authentication cookies ===
const DEFAULT_OPTIONS = {
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   sameSite: 'Strict' as const
}

/**
 * Sets the cookie containing the access token.
 * This cookie contains the JWT short-duration access token.
 * @param c - Hono Context
 * @param token - The JWT token to store
 */
export const setAccessToken = (c: Context, token: string) => {
   setCookie(c, COOKIE_NAMES.AUTH_SESSION, token,{
      ...DEFAULT_OPTIONS,
      maxAge: parseInt(process.env.JWT_ACCESS_EXPIRY ?? '900')
   })
}

/**
 * Sets the cookie containing the refresh token.
 * The duration depends on the “remember me” option.
 * @param c - Hono Context
 * @param token - The token to store
 * @param isRememberMe - If true, long duration, otherwise short
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
 * Defines the cookie containing the application session ID.
 * Used to identify the server-side session (e.g. in Redis).
 * Duration depends on the “remember me” option.
 * @param c - Hono Context
 * @param token - The token to store
 * @param isRememberMe - If true, long duration, otherwise short
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
 * Clear all auth cookie
 * @param c - Hono Context
 */
export const clearAuthCookies = (c: Context) => {
  deleteCookie(c, COOKIE_NAMES.AUTH_SESSION)
  deleteCookie(c, COOKIE_NAMES.USR_TOKEN)
  deleteCookie(c, COOKIE_NAMES.APP_ID)
}