import { useState } from 'react'
import { LogOut, UserRound } from 'lucide-react'
import { useI18n } from './i18n'
import type { SessionUser } from './session'

export default function AccountMenu({ user, beforeSignOut }: { user: SessionUser | null; beforeSignOut: () => void }) {
  const { locale, t } = useI18n()
  const [open, setOpen] = useState(false)
  if (!user) return <span className="local-session" title={t('La sesión de ChatGPT está disponible en el sitio publicado.')}>{t('Vista local')}</span>
  return <div className="account-menu" onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }}>
    <button className="account-button" aria-label={t('Cuenta')} aria-expanded={open} onClick={() => setOpen(!open)}><UserRound size={17}/><span>{t('Cuenta')}</span></button>
    {open && <><button className="menu-dismiss" aria-label={t('Cerrar opciones')} onClick={() => setOpen(false)}/><div className="account-popover">
      <strong>{user.name}</strong><span className="account-email">{user.email}</span>
      <p>{t('Tus diseños y eventos se guardan para esta cuenta en este navegador.')}</p>
      <a href={`/signout-with-chatgpt?return_to=${encodeURIComponent(`/welcome?signed_out=1&lang=${locale}`)}`} target="_top" onClick={beforeSignOut}><LogOut size={16}/>{t('Cerrar sesión')}</a>
    </div></>}
  </div>
}
