/**
 * Simple logout helper to clear auth cookie.
 */
export function logout() {
  document.cookie = "auth=; path=/; max-age=0"
}
