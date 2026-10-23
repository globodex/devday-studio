import { EVENTS_KEY, STORAGE_KEY } from './model'

export interface SessionUser { id: string; email: string; name: string }
export function readSession(): SessionUser | null {
  try {
    const value: unknown = JSON.parse(document.getElementById('devday-session')?.textContent || 'null')
    if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string' && 'email' in value && typeof value.email === 'string' && 'name' in value && typeof value.name === 'string') return { id: value.id, email: value.email, name: value.name }
  } catch { /* Local Vite preview has no hosted identity. */ }
  return null
}
export function storageForSession(user: SessionUser | null) {
  if (!user) return { design: STORAGE_KEY, events: EVENTS_KEY }
  const keys = { design: `${STORAGE_KEY}:${user.id}`, events: `${EVENTS_KEY}:${user.id}` }
  // One-time migration of the owner's existing local draft. Another account starts fresh.
  try {
    const marker = 'devday-studio:migrated-account:v1'
    if (!localStorage.getItem(marker)) {
      for (const [oldKey, newKey] of [[STORAGE_KEY, keys.design], [EVENTS_KEY, keys.events]]) {
        const value = localStorage.getItem(oldKey)
        if (value && !localStorage.getItem(newKey)) localStorage.setItem(newKey, value)
      }
      localStorage.setItem(marker, user.id)
    }
  } catch { /* The editor still works; its save warning reports storage failure. */ }
  return keys
}
