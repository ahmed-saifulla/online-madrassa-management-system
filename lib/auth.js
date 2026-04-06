// Utility to clear auth-related localStorage keys and notify the app
export function clearAuth() {
  if (typeof window === 'undefined') return
  try {
    const keys = Object.keys(localStorage)
    keys.forEach((k) => {
      if (k === 'access_token' || k === 'refresh_token' || k.startsWith('madrassa_')) {
        localStorage.removeItem(k)
      }
    })
  } catch (e) {}

  try {
    window.dispatchEvent(new Event('madrassa_auth_changed'))
  } catch (e) {}
}

export function isLoggedIn() {
  if (typeof window === 'undefined') return false
  return !!(localStorage.getItem('madrassa_admin') || localStorage.getItem('madrassa_teacher') || localStorage.getItem('madrassa_student'))
}
