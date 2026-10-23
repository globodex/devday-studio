import type { Locale, TranslationKey } from './i18n'
export type Template = 'community' | 'speaker' | 'editorial'
export type Format = 'square' | 'portrait' | 'story' | 'landscape'
export type Theme = 'dark' | 'light'
export type Motion = 'float' | 'orbit' | 'bounce' | 'waves' | 'expressions' | 'still'
export type ExportKind = 'png' | 'jpg' | 'gif' | 'video'

export interface Design {
  locale: Locale
  presetId: string
  template: Template
  title: string
  subtitle: string
  city: string
  date: string
  startTime: string
  endTime: string
  venue: string
  url: string
  organizer: string
  speaker: string
  role: string
  tagline: string
  badge: string
  photo: string
  photoZoom: number
  photoX: number
  photoY: number
  theme: Theme
  accent: string
  format: Format
  showAgents: boolean
  showBrand: boolean
  showFooter: boolean
  showUrl: boolean
  motion: Motion
  duration: number
  intensity: number
}

export interface EventPreset {
  id: string
  name: string
  city: string
  date: string
  startTime: string
  endTime: string
  venue: string
  url: string
  note?: string
}

export const EVENTS: EventPreset[] = [
  { id: 'guayaquil', city: 'Guayaquil', date: '2026-10-24', startTime: '10:00', endTime: '12:00', venue: 'Ubicación al registrarte', url: 'https://luma.com/kqtwlegj' },
  { id: 'manta', city: 'Manta', date: '2026-11-07', startTime: '11:00', endTime: '13:00', venue: 'Ubicación al registrarte', url: 'https://luma.com/kbp80p3l', note: 'Luma indica 7 nov., 11:00; su descripción dice 24 oct., 10:00. Confirma la fecha antes de publicar.' },
  { id: 'machala', city: 'Machala', date: '2026-11-11', startTime: '10:00', endTime: '12:00', venue: 'Ubicación al registrarte', url: 'https://luma.com/d6x6ojiv' },
  { id: 'quito', city: 'Quito', date: '2026-11-26', startTime: '10:00', endTime: '12:00', venue: 'Universidad Tecnológica Indoamérica', url: 'https://luma.com/z8wr54j3' },
].map(event => ({ ...event, name: `DevDay Community · ${event.city}` }))

export const FORMATS: Record<Format, { label: TranslationKey; ratio: string; width: number; height: number }> = {
  square: { label: 'Cuadrado', ratio: '1:1', width: 1080, height: 1080 },
  portrait: { label: 'Retrato', ratio: '4:5', width: 1080, height: 1350 },
  story: { label: 'Historia', ratio: '9:16', width: 1080, height: 1920 },
  landscape: { label: 'Horizontal', ratio: '16:9', width: 1920, height: 1080 },
}

export const ACCENTS = ['#00b647', '#9146ff', '#0668ff', '#ff7900']
export const DEFAULT_DESIGN: Design = {
  ...eventDetails(EVENTS[0]), locale: 'es', presetId: 'guayaquil', template: 'community', title: 'DevDay', subtitle: 'Community',
  organizer: 'The Builders · AI Ecuador', speaker: 'Israel J. Gómez', role: 'Codex Ambassador · The Builders',
  tagline: 'Nos vemos en DevDay.', badge: 'COMMUNITY EVENT', photo: '', photoZoom: 1, photoX: 50, photoY: 50,
  theme: 'dark', accent: ACCENTS[0], format: 'square', showAgents: true, showBrand: true, showFooter: true,
  showUrl: true, motion: 'orbit', duration: 6, intensity: 70,
}

export function assertNever(value: never): never { throw new Error(`Valor no compatible: ${String(value)}`) }

export function formatDate(date: string, locale: Locale = 'es'): string {
  const fallback = locale === 'en' ? 'DATE TO BE CONFIRMED' : 'FECHA POR CONFIRMAR'
  if (!isValidDate(date)) return fallback
  const value = new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'es-EC', { day: 'numeric', month: 'short', year: 'numeric' }).format(value).replaceAll('.', '').toUpperCase()
}

export function safeUrl(value: string): string | null {
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null } catch { return null }
}

export function parseDesign(raw: unknown): Design {
  if (!raw || typeof raw !== 'object') throw new Error('El archivo no contiene un diseño válido.')
  const value: Record<string, unknown> = Object.fromEntries(Object.entries(raw))
  const result = { ...DEFAULT_DESIGN }
  if (value.locale === 'en' || value.locale === 'es') result.locale = value.locale
  const strings = ['presetId','title','subtitle','city','date','startTime','endTime','venue','url','organizer','speaker','role','tagline','badge','photo'] as const
  for (const key of strings) {
    if (typeof value[key] === 'string') result[key] = value[key].slice(0, key === 'photo' ? 4_000_000 : 300)
  }
  const bools = ['showAgents','showBrand','showFooter','showUrl'] as const
  for (const key of bools) if (typeof value[key] === 'boolean') result[key] = value[key]
  const ranges = { photoZoom: [1,3], photoX: [0,100], photoY: [0,100], duration: [2,12], intensity: [0,100] } as const
  for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) {
    const n = value[key]; const [min,max] = ranges[key]
    if (typeof n === 'number' && Number.isFinite(n)) result[key] = Math.max(min,Math.min(max,n))
  }
  if (value.template === 'community' || value.template === 'speaker' || value.template === 'editorial') result.template = value.template
  if (value.theme === 'dark' || value.theme === 'light') result.theme = value.theme
  if (value.format === 'square' || value.format === 'portrait' || value.format === 'story' || value.format === 'landscape') result.format = value.format
  if (value.motion === 'float' || value.motion === 'orbit' || value.motion === 'bounce' || value.motion === 'waves' || value.motion === 'expressions' || value.motion === 'still') result.motion = value.motion
  if (typeof value.accent === 'string' && /^#[0-9a-f]{6}$/i.test(value.accent)) result.accent = value.accent
  if (result.photo && result.photo !== '/assets/host.jpg' && !/^data:image\/(jpeg|png|webp);base64,/.test(result.photo)) result.photo = ''
  return result
}

export const STORAGE_KEY = 'devday-studio:design:v1'
export function loadDesign(key = STORAGE_KEY): Design {
  try { const raw = localStorage.getItem(key); return raw ? parseDesign(JSON.parse(raw)) : { ...DEFAULT_DESIGN } } catch { return { ...DEFAULT_DESIGN } }
}

export const EVENTS_KEY = 'devday-studio:events:v1'
export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}
export function validateEvent(event: EventPreset): TranslationKey | null {
  if (!event.name.trim() || !event.city.trim() || !event.date || !/^([01]\d|2[0-3]):[0-5]\d$/.test(event.startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(event.endTime)) return 'Completa el nombre, la ciudad, la fecha y las horas.'
  if (!isValidDate(event.date)) return 'Introduce una fecha válida.'
  if (event.endTime <= event.startTime) return 'La hora de fin debe ser posterior a la hora de inicio.'
  if (event.url.trim() && !safeUrl(event.url.trim())) return 'Introduce un enlace http:// o https:// válido.'
  return null
}
export function parseEvents(raw: unknown): EventPreset[] {
  if (!Array.isArray(raw)) throw new Error('Invalid event list')
  const ids = new Set<string>()
  return raw.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('Invalid event')
    const value: Record<string, unknown> = Object.fromEntries(Object.entries(item))
    const event: EventPreset = { id: '', name: '', city: '', date: '', startTime: '', endTime: '', venue: '', url: '' }
    for (const key of Object.keys(event) as (keyof EventPreset)[]) {
      if (typeof value[key] !== 'string') throw new Error('Invalid event field')
      event[key] = value[key].slice(0, 300)
    }
    if (typeof value.note === 'string') event.note = value.note.slice(0, 500)
    if (!event.id || ids.has(event.id) || validateEvent(event)) throw new Error('Invalid event details')
    ids.add(event.id)
    return event
  })
}
export function loadEvents(key = EVENTS_KEY): EventPreset[] {
  try { const raw = localStorage.getItem(key); return raw ? parseEvents(JSON.parse(raw)) : EVENTS.map(event => ({ ...event })) } catch { return EVENTS.map(event => ({ ...event })) }
}
export function eventDetails(event: EventPreset): Pick<Design, 'presetId' | 'city' | 'date' | 'startTime' | 'endTime' | 'venue' | 'url'> {
  return { presetId: event.id, city: event.city, date: event.date, startTime: event.startTime, endTime: event.endTime, venue: event.venue, url: event.url }
}
