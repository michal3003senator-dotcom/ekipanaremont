import {
  ChevronRight,
  LogOut,
  type LucideIcon,
  MessageSquare,
  Settings,
  Store,
  Users,
  UserRound,
} from 'lucide-react'
import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'
import { getPanel } from '@/lib/panel/context'
import { getSettings } from '@/lib/settings'

import { logoutAction } from '../../(konto)/actions'
import { PanelHeading } from '../_components/PanelSection'

type Item = { href: string; label: string; detail: string; icon: LucideIcon }

export default async function MorePage() {
  const { firm, session } = await getPanel('/panel/wiecej')
  const { featureFlags } = await getSettings()
  const items: Item[] = [
    {
      href: '/panel/profil',
      label: 'Profil firmy',
      detail: 'Usługi, obszar, opis, dane kontaktowe',
      icon: UserRound,
    },
    {
      href: '/panel/opinie',
      label: 'Opinie',
      detail: 'Opinie klientów i Twoje odpowiedzi',
      icon: MessageSquare,
    },
    ...(featureFlags?.forum && firm?.status === 'active'
      ? [
          {
            href: '/forum',
            label: 'Forum firm',
            detail: 'Pytania i porady innych firm',
            icon: Users,
          },
        ]
      : []),
    ...(featureFlags?.marketplace && firm?.status === 'active'
      ? [
          {
            href: '/gielda',
            label: 'Giełda',
            detail: 'Sprzęt i materiały między firmami',
            icon: Store,
          },
        ]
      : []),
    {
      href: '/panel/ustawienia',
      label: 'Ustawienia konta',
      detail: 'Powiadomienia, hasło, e-mail, eksport i usunięcie konta',
      icon: Settings,
    },
  ]

  return (
    <>
      <PanelHeading title="Więcej" lead={session.email} />
      <ul className="flex flex-col border-t border-line">
        {items.map((item) => (
          <li key={item.href} className="border-b border-line">
            <Link href={item.href} className="flex min-h-16 items-center gap-4 py-3">
              <Icon icon={item.icon} className="size-6 text-text-muted" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">{item.label}</span>
                <span className="truncate text-small text-text-muted">{item.detail}</span>
              </span>
              <Icon icon={ChevronRight} className="size-5 text-text-muted" />
            </Link>
          </li>
        ))}
      </ul>
      <form action={logoutAction} className="mt-8">
        <button
          type="submit"
          className="flex min-h-11 items-center gap-3 text-small text-text-muted hover:text-text"
        >
          <Icon icon={LogOut} className="size-5" />
          Wyloguj się
        </button>
      </form>
    </>
  )
}
