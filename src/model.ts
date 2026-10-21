export type Template = 'community' | 'speaker' | 'editorial'
export type Format = 'square' | 'portrait' | 'story' | 'landscape'
export type Theme = 'dark' | 'light'
export type Motion = 'float' | 'expressions' | 'still'
export type ExportKind = 'png' | 'jpg' | 'gif' | 'video'

export interface Design {
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
]

export const FORMATS: Record<Format, { label: string; ratio: string; width: number; height: number }> = {
  square: { label: 'Cuadrado', ratio: '1:1', width: 1080, height: 1080 },
  portrait: { label: 'Retrato', ratio: '4:5', width: 1080, height: 1350 },
  story: { label: 'Historia', ratio: '9:16', width: 1080, height: 1920 },
  landscape: { label: 'Horizontal', ratio: '16:9', width: 1920, height: 1080 },
}

export const ACCENTS = ['#00b647', '#9146ff', '#0668ff', '#ff7900']
export const DEFAULT_DESIGN: Design = {
  ...EVENTS[0], presetId: 'guayaquil', template: 'community', title: 'DevDay', subtitle: 'Community',
  organizer: 'The Builders · AI Ecuador', speaker: 'Israel J. Gómez', role: 'Codex Ambassador · The Builders',
  tagline: 'Nos vemos en DevDay.', badge: 'COMMUNITY EVENT', photo: '', photoZoom: 1, photoX: 50, photoY: 50,
  theme: 'dark', accent: ACCENTS[0], format: 'square', showAgents: true, showBrand: true, showFooter: true,
  showUrl: true, motion: 'float', duration: 6, intensity: 50,
}

export function assertNever(value: never): never { throw new Error(`Valor no compatible: ${String(value)}`) }

export function formatDate(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'FECHA POR CONFIRMAR'
  const value = new Date(`${date}T12:00:00`)
  if (Number.isNaN(value.getTime())) return 'FECHA POR CONFIRMAR'
  return `${value.getDate()} ${['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][value.getMonth()]} ${value.getFullYear()}`
}

export function safeUrl(value: string): string | null {
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null } catch { return null }
}

export function parseDesign(raw: unknown): Design {
  if (!raw || typeof raw !== 'object') throw new Error('El archivo no contiene un diseño válido.')
  const value: Record<string, unknown> = Object.fromEntries(Object.entries(raw))
  const result = { ...DEFAULT_DESIGN }
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
  if (value.motion === 'float' || value.motion === 'expressions' || value.motion === 'still') result.motion = value.motion
  if (typeof value.accent === 'string' && /^#[0-9a-f]{6}$/i.test(value.accent)) result.accent = value.accent
  if (result.photo && result.photo !== '/assets/host.jpg' && !/^data:image\/(jpeg|png|webp);base64,/.test(result.photo)) result.photo = ''
  return result
}

export const STORAGE_KEY = 'devday-studio:design:v1'
export function loadDesign(): Design {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? parseDesign(JSON.parse(raw)) : { ...DEFAULT_DESIGN } } catch { return { ...DEFAULT_DESIGN } }
}
