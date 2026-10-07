import { Action, EmailLayout, Note, Paragraph } from './Layout'

/** Szablony e-maili fazy 4 (SPEC 3.15). Każdy ma temat i treść; wersję tekstową tworzy `sendEmail`. */
export type EmailTemplate = { subject: string; body: React.ReactElement }

export function verifyEmail(url: string): EmailTemplate {
  return {
    subject: 'Potwierdź adres e-mail',
    body: (
      <EmailLayout
        preview="Potwierdź adres, żeby dokończyć rejestrację firmy."
        heading="Potwierdź adres e-mail"
      >
        <Paragraph>Kliknij przycisk, żeby potwierdzić adres i przejść do profilu firmy.</Paragraph>
        <Action href={url}>Potwierdzam adres</Action>
        <Note>Link działa 24 godziny. Jeśli nie zakładałeś konta, zignoruj tę wiadomość.</Note>
      </EmailLayout>
    ),
  }
}

export function resetPassword(url: string): EmailTemplate {
  return {
    subject: 'Ustaw nowe hasło',
    body: (
      <EmailLayout
        preview="Link do ustawienia nowego hasła, ważny godzinę."
        heading="Ustaw nowe hasło"
      >
        <Paragraph>
          Ktoś poprosił o zmianę hasła do konta firmy. Jeśli to Ty, kliknij przycisk.
        </Paragraph>
        <Action href={url}>Ustawiam nowe hasło</Action>
        <Note>
          Link działa godzinę. Jeśli to nie Ty, zignoruj tę wiadomość – hasło się nie zmieni.
        </Note>
      </EmailLayout>
    ),
  }
}

export function profileApproved(panelUrl: string, trialEndsAt: string): EmailTemplate {
  return {
    subject: 'Profil firmy zatwierdzony',
    body: (
      <EmailLayout preview="Twój profil jest widoczny dla klientów." heading="Profil zatwierdzony">
        <Paragraph>
          Profil jest już widoczny w wyszukiwarce. Ustaw najbliższy wolny termin – po nim klienci
          wybierają firmy.
        </Paragraph>
        <Action href={panelUrl}>Ustawiam termin</Action>
        <Note>Okres próbny trwa do {trialEndsAt}.</Note>
      </EmailLayout>
    ),
  }
}

export function profileRejected(panelUrl: string, reason: string): EmailTemplate {
  return {
    subject: 'Profil firmy wymaga poprawek',
    body: (
      <EmailLayout preview="Moderator odesłał profil do poprawy." heading="Profil wymaga poprawek">
        <Paragraph>Moderator nie zatwierdził profilu. Uzasadnienie:</Paragraph>
        <Paragraph>„{reason}”</Paragraph>
        <Action href={panelUrl}>Poprawiam profil</Action>
        <Note>Możesz się odwołać od decyzji, odpowiadając na tę wiadomość.</Note>
      </EmailLayout>
    ),
  }
}

export function availabilityReminder(
  confirmUrl: string,
  panelUrl: string,
  date: string,
): EmailTemplate {
  return {
    subject: `Czy termin ${date} jest nadal wolny?`,
    body: (
      <EmailLayout
        preview="Potwierdź termin jednym kliknięciem, żeby został w wyszukiwarce."
        heading={`Termin ${date} nadal wolny?`}
      >
        <Paragraph>
          Klienci widzą tylko potwierdzone terminy. Jeśli nic się nie zmieniło, potwierdź jednym
          kliknięciem.
        </Paragraph>
        <Action href={confirmUrl}>Potwierdzam termin</Action>
        <Note>Termin się zmienił? Ustaw nowy w panelu: {panelUrl}</Note>
      </EmailLayout>
    ),
  }
}

export function availabilityExpired(panelUrl: string): EmailTemplate {
  return {
    subject: 'Termin wygasł – ustaw nowy',
    body: (
      <EmailLayout preview="Termin nie jest już pokazywany klientom." heading="Termin wygasł">
        <Paragraph>
          Termin minął albo nie był potwierdzany. Profil jest widoczny, ale bez wolnego terminu –
          firmy z terminem są wyżej w wynikach.
        </Paragraph>
        <Action href={panelUrl}>Ustawiam termin</Action>
      </EmailLayout>
    ),
  }
}

export function trialEnding(panelUrl: string, days: number, endsAt: string): EmailTemplate {
  const when = days === 1 ? 'jutro' : `za ${days} dni`
  return {
    subject: `Okres próbny kończy się ${when}`,
    body: (
      <EmailLayout
        preview={`Okres próbny kończy się ${endsAt}.`}
        heading={`Okres próbny kończy się ${when}`}
      >
        <Paragraph>
          Okres próbny trwa do {endsAt}. Szczegóły abonamentu znajdziesz w panelu.
        </Paragraph>
        <Action href={panelUrl}>Przechodzę do panelu</Action>
      </EmailLayout>
    ),
  }
}
