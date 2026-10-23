import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useI18n, type TranslationKey } from './i18n'
import { validateEvent, type EventPreset } from './model'

interface Props { initial: EventPreset; isNew: boolean; onChange: (event: EventPreset) => void; onSave: (event: EventPreset) => void; onClose: () => void }
export default function EventEditor({ initial: draft, isNew, onChange, onSave, onClose }: Props) {
  const { t } = useI18n()
  const [error, setError] = useState<TranslationKey | null>(null)
  const field = (key: keyof EventPreset, label: TranslationKey, type = 'text', required = false, maxLength = 100) => <label className="field"><span>{t(label)}{required ? ' *' : ''}</span><input type={type} value={draft[key] ?? ''} maxLength={maxLength} required={required} onChange={e => onChange({ ...draft, [key]: e.target.value })} /></label>
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const next = { ...draft, name: draft.name.trim(), city: draft.city.trim(), venue: draft.venue.trim(), url: draft.url.trim(), note: draft.note?.trim() }
    const issue = validateEvent(next)
    setError(issue)
    if (!issue) onSave(next)
  }
  return <form className="event-editor" onSubmit={submit} aria-label={t(isNew ? 'Nuevo evento' : 'Editar evento')}>
    <div className="section-heading"><h2>{t(isNew ? 'Nuevo evento' : 'Editar evento')}</h2><button className="icon-button" type="button" aria-label={t('Cerrar editor de evento')} onClick={onClose}><X size={17} /></button></div>
    <p className="field-hint">{t('Se guarda en este navegador. Estos datos se aplicarán al diseño actual.')}</p>
    {field('name', 'Nombre del evento', 'text', true)}
    {field('city', 'Ciudad', 'text', true, 45)}
    {field('date', 'Fecha', 'date', true)}
    <div className="two-columns">{field('startTime', 'Desde', 'time', true)}{field('endTime', 'Hasta', 'time', true)}</div>
    <p className="field-hint">{t('Hora de Ecuador · UTC−5')}</p>
    {field('venue', 'Lugar')}{field('url', 'Enlace de registro', 'url', false, 180)}
    <label className="field"><span>{t('Notas internas')} · {t('Opcional')}</span><textarea rows={2} maxLength={500} value={draft.note ?? ''} onChange={e => onChange({ ...draft, note: e.target.value })} /></label>
    {error && <p className="event-error" role="alert">{t(error)}</p>}
    <div className="event-actions"><button className="secondary-button" type="button" onClick={onClose}>{t('Cancelar')}</button><button className="primary-button" type="submit">{t(isNew ? 'Crear y usar evento' : 'Guardar y usar evento')}</button></div>
  </form>
}
