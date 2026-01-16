/**
 * Custom event system for userType localStorage changes.
 * Replaces polling with event-driven updates for better performance.
 */

export const USER_TYPE_CHANGE_EVENT = 'userTypeChange'

export type UserType = 'dev' | 'not-dev'

/**
 * Set user type in localStorage and dispatch a custom event.
 * Use this instead of directly calling localStorage.setItem('userType', ...)
 */
export function setUserType(type: UserType): void {
  if (typeof window === 'undefined') return

  localStorage.setItem('userType', type)
  window.dispatchEvent(new CustomEvent(USER_TYPE_CHANGE_EVENT, { detail: type }))
}

/**
 * Get the current user type from localStorage.
 */
export function getUserType(): UserType {
  if (typeof window === 'undefined') return 'dev'

  const stored = localStorage.getItem('userType')
  return (stored === 'dev' || stored === 'not-dev') ? stored : 'dev'
}
