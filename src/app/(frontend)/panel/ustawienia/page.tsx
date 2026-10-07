import { getPanel } from '@/lib/panel/context'

import { PanelHeading, PanelSection } from '../_components/PanelSection'
import {
  DeleteAccountForm,
  EmailForm,
  ExportForm,
  NotificationsForm,
  PasswordForm,
} from './SettingsForms'

export default async function SettingsPage() {
  const { session } = await getPanel('/panel/ustawienia')
  const prefs = session.notificationPrefs
  return (
    <>
      <PanelHeading title="Ustawienia konta" />
      <div className="flex flex-col gap-10">
        <PanelSection title="Powiadomienia e-mail">
          <NotificationsForm
            initial={{
              inquiries: prefs?.inquiries ?? true,
              availabilityReminders: prefs?.availabilityReminders ?? true,
              reviews: prefs?.reviews ?? true,
            }}
          />
        </PanelSection>
        <PanelSection title="Hasło">
          <PasswordForm />
        </PanelSection>
        <PanelSection title="E-mail">
          <EmailForm current={session.email} />
        </PanelSection>
        <PanelSection title="Twoje dane">
          <ExportForm />
        </PanelSection>
        <PanelSection title="Usunięcie konta">
          <DeleteAccountForm />
        </PanelSection>
      </div>
    </>
  )
}
