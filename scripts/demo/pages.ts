import type { DocPart } from './doc'

export type SeedPage = {
  slug: string
  title: string
  legalKind?: 'terms' | 'privacy'
  legalVersion?: string
  effectiveFrom?: string
  parts: DocPart[]
}

/** Dane operatora do uzupełnienia – wspólne dla wszystkich dokumentów. */
export const OPERATOR = {
  name: '[nazwa operatora]',
  address: '[adres siedziby]',
  nip: '[NIP]',
  email: 'kontakt@ekipanatermin.pl',
  privacyEmail: 'prywatnosc@ekipanatermin.pl',
  reportsEmail: 'zgloszenia@ekipanatermin.pl',
}

const EFFECTIVE_FROM = '2026-11-01T00:00:00.000Z'

/** Adres e-mail jako link `mailto:` w zapisie inline. */
const mail = (address: string) => `[${address}](mailto:${address})`

const operatorLine = `${OPERATOR.name}, ${OPERATOR.address}, NIP ${OPERATOR.nip}`

const terms: DocPart[] = [
  { h2: '§ 1. Postanowienia ogólne' },
  {
    ol: [
      'Niniejszy regulamin (dalej: „Regulamin”) określa zasady korzystania z serwisu internetowego Ekipa na Termin, dostępnego pod adresem ekipanatermin.pl (dalej: „Serwis”), w tym rodzaje i zakres usług świadczonych drogą elektroniczną, warunki zawierania i rozwiązywania umów oraz tryb postępowania reklamacyjnego.',
      'Regulamin jest regulaminem, o którym mowa w art. 8 ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną, i zawiera informacje wymagane przez rozporządzenie Parlamentu Europejskiego i Rady (UE) 2022/2065 w sprawie jednolitego rynku usług cyfrowych (dalej: „DSA”).',
      `Usługodawcą i operatorem Serwisu jest ${operatorLine} (dalej: „Usługodawca”). Kontakt z Usługodawcą: ${mail(OPERATOR.email)}.`,
      'Regulamin jest udostępniany nieodpłatnie w Serwisie w sposób umożliwiający jego pozyskanie, odtwarzanie i utrwalanie. Zasady przetwarzania danych osobowych określa [Polityka prywatności](/polityka-prywatnosci).',
    ],
  },

  { h2: '§ 2. Definicje' },
  { p: 'Użyte w Regulaminie pojęcia oznaczają:' },
  {
    ol: [
      '**Klient** – osoba korzystająca z Serwisu bez Konta Firmy, w szczególności wyszukująca Firmy, wysyłająca Zapytania i wystawiająca Opinie.',
      '**Firma** – przedsiębiorca posiadający numer NIP, wykonujący prace remontowe lub budowlane, który założył Konto Firmy.',
      '**Użytkownik** – Klient lub Firma.',
      '**Konto Firmy** – chroniony hasłem zbiór zasobów i ustawień Firmy w Serwisie, obejmujący Profil i panel Firmy.',
      '**Profil** – publiczna prezentacja Firmy w Serwisie, obejmująca w szczególności opis, obszar działania, realizacje, Opinie i Wolny termin.',
      '**Wolny termin** – wskazana i potwierdzona przez Firmę najbliższa data, od której Firma deklaruje gotowość rozpoczęcia nowych prac.',
      '**Zapytanie** – wiadomość Klienta skierowana do wybranej Firmy za pomocą formularza w Serwisie.',
      '**Opinia** – ocena i komentarz Klienta dotyczące Firmy, wystawione na podstawie Zapytania.',
      '**Forum** – zamknięta część Serwisu przeznaczona do wymiany informacji między Firmami.',
      '**Giełda** – zamknięta część Serwisu, w której Firmy publikują ogłoszenia sprzedaży lub zamiany sprzętu i materiałów.',
      '**Treść** – każda informacja zamieszczona w Serwisie przez Użytkownika, w tym tekst, zdjęcie, Opinia, wpis, ogłoszenie i wiadomość.',
      '**Okres próbny** – 30-dniowy okres nieodpłatnego korzystania przez Firmę z usług dla Firm.',
      '**Abonament** – odpłatna usługa dla Firm świadczona po zakończeniu Okresu próbnego.',
    ],
  },

  { h2: '§ 3. Rodzaje usług i wymagania techniczne' },
  { p: 'Usługodawca świadczy drogą elektroniczną następujące usługi:' },
  {
    ul: [
      'udostępnianie katalogu i wyszukiwarki Firm, Profili, artykułów i kalkulatorów;',
      'formularz Zapytania i formularz Opinii;',
      'formularz kontaktu przy kalkulatorze, za pomocą którego Klient może, na podstawie odrębnej zgody, poprosić o kontakt;',
      'formularz zgłaszania Treści („Zgłoś”);',
      'Konto Firmy wraz z Profilem, obsługą Zapytań, Opinii i Wolnego terminu;',
      'Forum i Giełdę – dla Firm spełniających warunki określone w § 10.',
    ],
  },
  {
    p: 'Umowa o świadczenie usług dostępnych bez Konta Firmy zostaje zawarta z chwilą rozpoczęcia korzystania z danej usługi i ulega rozwiązaniu z chwilą zakończenia korzystania z niej. Umowa o prowadzenie Konta Firmy zostaje zawarta na czas nieokreślony z chwilą potwierdzenia adresu e-mail.',
  },
  {
    p: 'Do korzystania z Serwisu niezbędne są: urządzenie z dostępem do internetu oraz jedna z dwóch najnowszych wersji przeglądarki Chrome, Safari, Firefox lub Edge z włączoną obsługą JavaScript. Korzystanie z Konta Firmy wymaga ponadto obsługi plików cookies i aktywnego adresu e-mail.',
  },
  {
    p: 'Korzystanie z internetu wiąże się z typowymi zagrożeniami, takimi jak złośliwe oprogramowanie lub próby wyłudzenia danych (phishing). Usługodawca nigdy nie prosi o podanie hasła w wiadomości e-mail ani telefonicznie.',
  },

  { h2: '§ 4. Usługi dla Klientów' },
  {
    ol: [
      'Korzystanie z Serwisu przez Klientów jest bezpłatne i nie wymaga zakładania konta.',
      'Wyniki wyszukiwania są domyślnie uporządkowane według najbliższego aktywnego Wolnego terminu, a następnie według średniej oceny z Opinii. Firmy bez aktywnego Wolnego terminu są wyświetlane na końcu listy z oznaczeniem „Zapytaj o termin”. Klient może zawęzić wyniki filtrami. W katalogu wyświetlane są wyłącznie Firmy z zatwierdzonym i aktywnym Profilem. Serwis nie oferuje płatnego wyróżniania w wynikach.',
      'Wyniki kalkulatorów mają charakter szacunkowy i poglądowy. Nie stanowią oferty ani wyceny prac.',
    ],
  },

  { h2: '§ 5. Konto Firmy, rejestracja i weryfikacja' },
  {
    ol: [
      'Konto Firmy może założyć wyłącznie przedsiębiorca posiadający numer NIP albo osoba uprawniona do działania w jego imieniu. Rejestracja wymaga podania adresu e-mail, ustalenia hasła oraz akceptacji Regulaminu i Polityki prywatności. Usługodawca zapisuje wersję zaakceptowanych dokumentów i datę akceptacji.',
      'Firma potwierdza adres e-mail, korzystając z linku przesłanego przez Serwis. Link jest ważny 24 godziny.',
      'Usługodawca weryfikuje numer NIP w publicznych rejestrach: Centralnej Ewidencji i Informacji o Działalności Gospodarczej (CEIDG), Krajowym Rejestrze Sądowym (KRS) i Wykazie podatników VAT, i na tej podstawie uzupełnia nazwę i adres Firmy. Jednemu numerowi NIP odpowiada jeden Profil.',
      'Firma uzupełnia Profil, w tym dodaje co najmniej 3 zdjęcia realizacji, i przesyła go do akceptacji. Moderator zatwierdza Profil albo odmawia jego zatwierdzenia, podając uzasadnienie. Firma otrzymuje informację o decyzji e-mailem.',
      'Firma odpowiada za prawdziwość i aktualność danych w Profilu oraz za posiadanie praw do publikowanych zdjęć i opisów. Zdjęcia realizacji przedstawiają prace wykonane przez Firmę.',
      'Firma zachowuje w poufności dane logowania. Firma może w każdej chwili pobrać swoje dane z panelu oraz usunąć Konto Firmy, co powoduje rozwiązanie umowy o prowadzenie Konta Firmy.',
    ],
  },

  { h2: '§ 6. Okres próbny i Abonament' },
  {
    ol: [
      'Okres próbny rozpoczyna się z chwilą zatwierdzenia Profilu i trwa 30 dni. W Okresie próbnym Firma korzysta z usług dla Firm nieodpłatnie.',
      'Serwis przypomina Firmie e-mailem o zbliżającym się końcu Okresu próbnego.',
      'Po zakończeniu Okresu próbnego dalsze korzystanie z usług dla Firm wymaga wykupienia Abonamentu. Zasady płatności za abonament określa cennik opublikowany w Serwisie.',
      'Do czasu wykupienia Abonamentu Usługodawca może wyłączyć wyświetlanie Profilu w katalogu oraz wstrzymać dostęp do Forum i Giełdy.',
    ],
  },

  { h2: '§ 7. Profil i Wolny termin' },
  {
    ol: [
      'Wolny termin jest deklaracją Firmy. Nie stanowi rezerwacji ani zobowiązania Firmy wobec Klienta, a Usługodawca nie gwarantuje jego dostępności.',
      'Firma jest zobowiązana utrzymywać Wolny termin w stanie aktualnym i regularnie potwierdzać go w panelu. Wolny termin może przypadać najpóźniej 180 dni od dnia jego ustawienia.',
      'Serwis wyświetla datę ostatniego potwierdzenia Wolnego terminu. Termin niepotwierdzony w okresie wskazanym w panelu Firmy, a także termin, którego data minęła, przestaje być aktywny. Przed wygaśnięciem terminu Serwis wysyła Firmie przypomnienie.',
      'Podawanie Wolnego terminu, którego Firma nie zamierza dotrzymać, stanowi wprowadzanie Klientów w błąd i może skutkować sankcjami określonymi w § 14.',
    ],
  },

  { h2: '§ 8. Zapytania' },
  {
    ol: [
      'Klient może wysłać Zapytanie do wybranej Firmy, podając w szczególności rodzaj prac, miejscowość, opis, imię i adres e-mail. Podanie numeru telefonu jest dobrowolne.',
      'Usługodawca przekazuje Zapytanie Firmie za pośrednictwem panelu Firmy. Usługodawca nie jest stroną rozmów ani umów zawieranych między Klientem a Firmą i nie gwarantuje, że Firma odpowie na Zapytanie lub przyjmie zlecenie.',
      'Warunki prac, w tym cenę, termin, zakres i gwarancję, Klient ustala bezpośrednio z Firmą.',
      'Firma może wykorzystywać dane z Zapytania wyłącznie w celu udzielenia odpowiedzi oraz zawarcia i wykonania umowy z Klientem. Wykorzystywanie tych danych w celach marketingowych bez odrębnej zgody Klienta jest zabronione.',
      'W celu ochrony przed nadużyciami Serwis stosuje zabezpieczenie przed botami oraz limit liczby Zapytań wysyłanych z jednego adresu IP.',
    ],
  },

  { h2: '§ 9. Opinie' },
  {
    ol: [
      'Opinię może wystawić wyłącznie Klient, który wysłał Zapytanie, za pomocą jednorazowego linku przesłanego mu e-mailem. Link jest ważny 30 dni. Do jednego Zapytania można wystawić jedną Opinię.',
      'Opinia zawiera ocenę w skali od 1 do 5, treść oraz podpis w postaci imienia i dzielnicy lub miejscowości. Opinia powinna opisywać rzeczywiste doświadczenia Klienta z Firmą.',
      'Opinie są publikowane po zatwierdzeniu przez moderatora. Zasady weryfikacji opisuje strona [Jak sprawdzamy opinie](/jak-sprawdzamy-opinie).',
      'Firma może jednokrotnie opublikować odpowiedź na Opinię oraz zgłosić Opinię, jeżeli uważa, że narusza ona prawo lub Regulamin.',
      'Zabronione jest wystawianie Opinii w zamian za korzyść, wystawianie Opinii o własnej Firmie lub o Firmie konkurencyjnej oraz zlecanie wystawiania Opinii innym osobom.',
    ],
  },

  { h2: '§ 10. Forum i Giełda' },
  {
    ol: [
      'Z Forum i Giełdy mogą korzystać wyłącznie Firmy z potwierdzonym adresem e-mail, zweryfikowanym numerem NIP, zatwierdzonym Profilem, trwającym Okresem próbnym lub aktywnym Abonamentem i bez blokady. Usługodawca może czasowo wyłączyć Forum lub Giełdę.',
      'Pierwsze wpisy na Forum i pierwsze ogłoszenia na Giełdzie nowej Firmy są publikowane po zatwierdzeniu przez moderatora. Wpisy zawierające określone słowa mogą zostać wstrzymane do czasu sprawdzenia przez moderatora.',
      'Ogłoszenie na Giełdzie wygasa po 30 dniach i może zostać przedłużone. Wiadomości do ogłoszeniodawcy są przekazywane bez ujawniania adresów e-mail stron.',
      'Usługodawca nie jest stroną transakcji zawieranych w związku z ogłoszeniami na Giełdzie, nie pośredniczy w płatnościach i nie odpowiada za stan, pochodzenie, legalność ani wydanie przedmiotów ogłoszeń. Rozliczenia i roszczenia z tytułu wad strony transakcji wyjaśniają między sobą.',
      'Ogłoszenie, wobec którego co najmniej trzy różne Firmy zgłoszą podejrzenie kradzieży, zostaje automatycznie i tymczasowo ukryte do czasu decyzji moderatora. Podanie numeru seryjnego przedmiotu jest dobrowolne; numer nie jest publikowany i jest dostępny wyłącznie dla moderacji.',
    ],
  },

  { h2: '§ 11. Treści zabronione' },
  { p: 'Użytkownik nie może zamieszczać w Serwisie Treści:' },
  {
    ul: [
      'bezprawnych, w tym naruszających dobra osobiste, prawa autorskie, prawa do znaków towarowych lub tajemnicę przedsiębiorstwa;',
      'obraźliwych, wulgarnych, nawołujących do nienawiści lub przemocy;',
      'zawierających dane osobowe innych osób bez podstawy prawnej, w szczególności adresy i numery telefonów osób prywatnych;',
      'wprowadzających w błąd, w tym nieprawdziwych Opinii, cudzych realizacji i Wolnych terminów niezgodnych z rzeczywistością;',
      'dotyczących przedmiotów pochodzących z przestępstwa lub wyłączonych z obrotu;',
      'stanowiących spam lub reklamę niezwiązaną z przeznaczeniem danej części Serwisu;',
      'zawierających złośliwe oprogramowanie lub odesłania do niego.',
    ],
  },
  {
    p: 'Użytkownik nie może podszywać się pod inne osoby lub przedsiębiorców ani zakłócać działania Serwisu, w tym przez masowe, automatyczne pobieranie danych.',
  },

  { h2: '§ 12. Zgłaszanie treści nielegalnych' },
  {
    ol: [
      `Każdy może zgłosić Treść, którą uważa za nielegalną lub niezgodną z Regulaminem, za pomocą przycisku „Zgłoś” przy Profilu, Opinii, wpisie, ogłoszeniu lub artykule albo e-mailem na adres ${mail(OPERATOR.reportsEmail)}.`,
      'Zgłoszenie powinno zawierać: wskazanie Treści, najlepiej przez adres strony; wyjaśnienie, dlaczego zgłaszający uważa ją za nielegalną lub niezgodną z Regulaminem; adres e-mail zgłaszającego oraz oświadczenie, że zgłoszenie jest dokonywane w dobrej wierze, a zawarte w nim informacje są prawidłowe i kompletne.',
      'Usługodawca potwierdza przyjęcie zgłoszenia e-mailem, rozpatruje je bez zbędnej zwłoki, w sposób staranny, obiektywny i niearbitralny, a następnie informuje zgłaszającego o decyzji i o możliwości jej zaskarżenia.',
      `Punktem kontaktowym, o którym mowa w art. 11 i 12 DSA, dla Użytkowników oraz dla organów państw członkowskich, Komisji Europejskiej i Europejskiej Rady ds. Usług Cyfrowych jest adres ${mail(OPERATOR.email)}. Kontakt jest możliwy w języku polskim i angielskim.`,
    ],
  },

  { h2: '§ 13. Decyzje moderacyjne, uzasadnienie i odwołanie' },
  {
    ol: [
      'Usługodawca moderuje Treści w celu zapewnienia ich zgodności z prawem i Regulaminem. Moderację wspierają narzędzia automatyczne opisane w § 10, które wyłącznie wstrzymują publikację lub tymczasowo ukrywają Treść. Decyzje rozstrzygające podejmują moderatorzy.',
      'O każdej decyzji ograniczającej, w szczególności o usunięciu lub ukryciu Treści, odmowie zatwierdzenia Profilu, zawieszeniu lub blokadzie konta, Usługodawca informuje Użytkownika e-mailem. Uzasadnienie wskazuje rodzaj i zakres ograniczenia, fakty i okoliczności, na których oparto decyzję, jej podstawę w przepisach prawa lub w Regulaminie, informację o wykorzystaniu narzędzi automatycznych oraz dostępne środki zaskarżenia.',
      `Od decyzji Usługodawcy, w tym od decyzji w sprawie zgłoszenia, przysługuje bezpłatne odwołanie w terminie 6 miesięcy od dnia otrzymania informacji o decyzji. Odwołanie składa się za pomocą linku w wiadomości z decyzją albo e-mailem na adres ${mail(OPERATOR.reportsEmail)}. Odwołanie rozpatruje człowiek, bez zbędnej zwłoki. Jeżeli odwołanie jest zasadne, Usługodawca uchyla lub zmienia decyzję.`,
      'Użytkownik może także skorzystać z pozasądowego rozstrzygania sporów przed organem certyfikowanym zgodnie z art. 21 DSA albo dochodzić swoich praw przed sądem.',
      'Szczegółowe zasady opisuje strona [Zasady moderacji](/zasady-moderacji).',
    ],
  },

  { h2: '§ 14. Sankcje' },
  {
    ol: [
      'W razie naruszenia prawa lub Regulaminu Usługodawca może, stosownie do wagi naruszenia: udzielić ostrzeżenia, ukryć lub usunąć Treść, odmówić zatwierdzenia lub zawiesić Profil, czasowo zablokować dostęp do Forum, Giełdy lub całego Konta Firmy, a w razie rażących lub powtarzających się naruszeń – wypowiedzieć umowę o prowadzenie Konta Firmy.',
      'Wypowiedzenie następuje z zachowaniem 14-dniowego okresu wypowiedzenia, a w razie rażącego naruszenia, w szczególności publikowania treści nielegalnych lub działań wymierzonych w bezpieczeństwo Serwisu, ze skutkiem natychmiastowym.',
      'Zgodnie z art. 23 DSA Usługodawca może, po uprzednim ostrzeżeniu, na rozsądny okres zawiesić świadczenie usług na rzecz Użytkownika, który często dostarcza treści w oczywisty sposób nielegalne, a także rozpatrywanie zgłoszeń osoby, która często dokonuje zgłoszeń w oczywisty sposób bezzasadnych.',
    ],
  },

  { h2: '§ 15. Odpowiedzialność' },
  {
    ol: [
      'Serwis łączy Klientów z Firmami. Usługodawca nie jest stroną umów o prace ani transakcji między Firmami i nie odpowiada za ich zawarcie, wykonanie, jakość, terminowość ani cenę.',
      'Usługodawca odpowiada za Treści Użytkowników wyłącznie na zasadach określonych w art. 6 DSA, w szczególności gdy po uzyskaniu wiedzy o nielegalnym charakterze Treści nie podejmie niezwłocznie działań w celu jej usunięcia lub uniemożliwienia do niej dostępu.',
      'Dane rejestrowe Firm pochodzą z publicznych rejestrów, a pozostałe informacje w Profilu, w tym Wolny termin, podaje Firma. Usługodawca dokłada należytej staranności przy weryfikacji, lecz nie gwarantuje bezbłędności tych informacji.',
      'Usługodawca dokłada starań, aby Serwis działał nieprzerwanie, jednak może czasowo ograniczyć jego dostępność w związku z pracami technicznymi lub koniecznością zapewnienia bezpieczeństwa.',
      'Ograniczenia odpowiedzialności przewidziane w Regulaminie nie dotyczą szkód wyrządzonych umyślnie i nie wyłączają ani nie ograniczają uprawnień konsumentów wynikających z bezwzględnie obowiązujących przepisów prawa.',
    ],
  },

  { h2: '§ 16. Reklamacje' },
  {
    ol: [
      `Reklamacje dotyczące działania Serwisu można składać e-mailem na adres ${mail(OPERATOR.email)} albo pisemnie na adres siedziby Usługodawcy.`,
      'Reklamacja powinna zawierać dane umożliwiające kontakt, opis problemu oraz, w miarę możliwości, oczekiwany sposób jego rozwiązania.',
      'Usługodawca rozpatruje reklamację w terminie 14 dni od dnia jej otrzymania i przesyła odpowiedź na adres e-mail albo adres wskazany w reklamacji.',
      'Reklamacje dotyczące prac wykonanych przez Firmę lub transakcji na Giełdzie należy kierować bezpośrednio do drugiej strony umowy.',
    ],
  },

  { h2: '§ 17. Konsumenci i przedsiębiorcy na prawach konsumenta' },
  {
    ol: [
      'Postanowienia Regulaminu nie wyłączają ani nie ograniczają praw konsumentów wynikających z bezwzględnie obowiązujących przepisów prawa. W razie sprzeczności pierwszeństwo mają te przepisy.',
      'Klient będący konsumentem może w każdej chwili zakończyć korzystanie z bezpłatnych usług Serwisu bez ponoszenia kosztów.',
      'Do Firmy będącej osobą fizyczną, która zawiera umowę bezpośrednio związaną z jej działalnością gospodarczą, gdy z treści tej umowy wynika, że nie posiada ona dla niej charakteru zawodowego, wynikającego w szczególności z przedmiotu wykonywanej działalności gospodarczej udostępnionego w CEIDG, stosuje się przepisy dotyczące konsumenta w zakresie przewidzianym w art. 385⁵ Kodeksu cywilnego (niedozwolone postanowienia umowne) oraz w art. 38a ustawy z dnia 30 maja 2014 r. o prawach konsumenta (prawo odstąpienia od umowy zawartej na odległość w terminie 14 dni).',
    ],
  },

  { h2: '§ 18. Pozasądowe rozwiązywanie sporów' },
  {
    ol: [
      'Konsument może skorzystać z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń. W szczególności może zwrócić się o bezpłatną pomoc do miejskiego lub powiatowego rzecznika konsumentów albo do organizacji społecznej, do której zadań statutowych należy ochrona konsumentów, a także złożyć wniosek o przeprowadzenie postępowania w sprawie pozasądowego rozwiązania sporu do wojewódzkiego inspektora Inspekcji Handlowej albo o rozpatrzenie sprawy przez stały polubowny sąd konsumencki działający przy wojewódzkim inspektoracie Inspekcji Handlowej.',
      'Skorzystanie z pozasądowych sposobów rozwiązywania sporów jest dobrowolne. W razie nieuwzględnienia reklamacji Usługodawca informuje konsumenta, czy wyraża zgodę na udział w takim postępowaniu.',
    ],
  },

  { h2: '§ 19. Zmiany Regulaminu i postanowienia końcowe' },
  {
    ol: [
      'Usługodawca może zmienić Regulamin z ważnych przyczyn, w szczególności w razie zmiany przepisów prawa, zmiany zakresu lub sposobu świadczenia usług albo ze względów bezpieczeństwa.',
      'O zmianie Regulaminu Usługodawca informuje Firmy e-mailem, a pozostałych Użytkowników komunikatem w Serwisie, co najmniej 14 dni przed dniem wejścia zmian w życie. Firma, która nie akceptuje zmian, może przed tym dniem wypowiedzieć umowę o prowadzenie Konta Firmy ze skutkiem natychmiastowym.',
      'W sprawach nieuregulowanych w Regulaminie stosuje się prawo polskie. Wybór prawa nie pozbawia konsumenta ochrony przysługującej mu na podstawie przepisów, których nie można wyłączyć w drodze umowy, na mocy prawa państwa jego zwykłego pobytu.',
      'Spory z Użytkownikami niebędącymi konsumentami rozstrzyga sąd właściwy dla siedziby Usługodawcy. Postanowienie to nie dotyczy osób, o których mowa w § 17 ust. 3.',
      'Regulamin obowiązuje od dnia 1 listopada 2026 r.',
    ],
  },
]

const privacy: DocPart[] = [
  { h2: '1. Administrator danych' },
  {
    p: `Administratorem danych osobowych przetwarzanych w serwisie ekipanatermin.pl (dalej: „Serwis”) jest ${operatorLine} (dalej: „Administrator” lub „my”). W sprawach dotyczących danych osobowych napisz na adres ${mail(OPERATOR.privacyEmail)}.`,
  },
  {
    p: 'Polityka wyjaśnia, jakie dane przetwarzamy, w jakich celach i na jakiej podstawie, komu je przekazujemy i jakie prawa Ci przysługują. Pojęcia pisane wielką literą mają znaczenie nadane im w [Regulaminie](/regulamin). Przetwarzamy dane zgodnie z rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (dalej: „RODO”).',
  },

  { h2: '2. Cele, podstawy prawne i okresy przechowywania' },
  { p: 'Przetwarzamy tylko te dane, które są potrzebne do danego celu.' },

  { h3: 'Konta i profile firm' },
  {
    ul: [
      '**Dane:** adres e-mail, hasło (wyłącznie w postaci skrótu kryptograficznego), NIP, nazwa, adres i dane z publicznych rejestrów, dane Profilu (opis, obszar działania, numer telefonu, strona internetowa, zdjęcia realizacji, Wolny termin), wersja i data akceptacji Regulaminu i Polityki prywatności, ustawienia powiadomień.',
      '**Źródło:** dane rejestrowe pobieramy na podstawie podanego numeru NIP z CEIDG, KRS i Wykazu podatników VAT; pozostałe dane podaje Firma.',
      '**Podstawa prawna:** art. 6 ust. 1 lit. b RODO – zawarcie i wykonanie umowy o prowadzenie Konta Firmy; art. 6 ust. 1 lit. f RODO – nasz prawnie uzasadniony interes w weryfikacji Firm, wykazaniu akceptacji dokumentów oraz ustaleniu, dochodzeniu i obronie roszczeń; art. 6 ust. 1 lit. c RODO – obowiązki podatkowe i rachunkowe związane z Abonamentem.',
      '**Okres przechowywania:** do usunięcia Konta Firmy, a następnie do upływu terminu przedawnienia roszczeń; dokumenty rozliczeniowe – przez okres wymagany przepisami podatkowymi i rachunkowymi. Po usunięciu konta Profil przestaje być publicznie dostępny.',
    ],
  },

  { h3: 'Zapytania' },
  {
    ul: [
      '**Dane:** imię, adres e-mail, numer telefonu (opcjonalnie), miejscowość, opis prac, budżet, planowany termin, zdjęcia, wersja i data zgody, skrót adresu IP.',
      '**Podstawa prawna:** art. 6 ust. 1 lit. b RODO – przekazanie Zapytania wybranej Firmie na Twoje żądanie; art. 6 ust. 1 lit. f RODO – wysłanie prośby o Opinię, ochrona przed nadużyciami oraz ustalenie, dochodzenie i obrona roszczeń.',
      '**Okres przechowywania:** 24 miesiące od wysłania Zapytania; po tym czasie dane osobowe są anonimizowane.',
    ],
  },
  {
    p: 'Firma, do której wysyłasz Zapytanie, otrzymuje Twoje dane i staje się ich odrębnym administratorem w zakresie, w jakim wykorzystuje je do kontaktu z Tobą oraz do zawarcia i wykonania umowy. Powiadomienie e-mail o nowym Zapytaniu nie zawiera Twoich danych – Firma odczytuje je po zalogowaniu do panelu. Zdjęcia dołączone do Zapytania są dostępne wyłącznie dla tej Firmy.',
  },

  { h3: 'Opinie' },
  {
    ul: [
      '**Dane:** ocena, tytuł, treść, podpis w postaci imienia oraz dzielnicy lub miejscowości, powiązanie z Zapytaniem.',
      '**Podstawa prawna:** art. 6 ust. 1 lit. b RODO – publikacja Opinii na Twoje żądanie zgodnie z Regulaminem; art. 6 ust. 1 lit. f RODO – weryfikacja autentyczności Opinii i rozpatrywanie zgłoszeń.',
      '**Okres przechowywania:** do usunięcia Profilu Firmy albo do czasu, gdy zażądasz usunięcia Opinii; dane Opinii, której nie opublikowano, przechowujemy przez czas potrzebny do rozpatrzenia ewentualnego odwołania.',
    ],
  },
  {
    p: 'Publicznie pokazujemy wyłącznie imię oraz dzielnicę lub miejscowość autora Opinii. Nigdy nie publikujemy nazwiska, adresu e-mail ani numeru telefonu.',
  },

  { h3: 'Kontakt z kalkulatora' },
  {
    ul: [
      '**Dane:** imię, adres e-mail, numer telefonu, parametry i wynik kalkulacji, wersja i data zgody.',
      '**Podstawa prawna:** art. 6 ust. 1 lit. a RODO – Twoja zgoda na kontakt w sprawie kalkulacji.',
      '**Okres przechowywania:** do wycofania zgody, nie dłużej niż 12 miesięcy od jej wyrażenia.',
    ],
  },

  { h3: 'Forum i Giełda' },
  {
    ul: [
      '**Dane:** dane Firmy widoczne dla innych Firm, treść wpisów, ogłoszeń i wiadomości, zdjęcia, reakcje, opcjonalny numer seryjny przedmiotu (szyfrowany, niepubliczny, dostępny wyłącznie dla moderacji).',
      '**Podstawa prawna:** art. 6 ust. 1 lit. b RODO – świadczenie usług Forum i Giełdy; art. 6 ust. 1 lit. f RODO – moderacja oraz przeciwdziałanie obrotowi przedmiotami pochodzącymi z kradzieży.',
      '**Okres przechowywania:** do usunięcia Treści lub Konta Firmy. Wpis usunięty przez autora zostaje ukryty, a wątek pozostaje widoczny.',
    ],
  },

  { h3: 'Zgłoszenia treści (DSA)' },
  {
    ul: [
      '**Dane:** treść zgłoszenia, powód, adres e-mail zgłaszającego (szyfrowany) albo Konto Firmy, przebieg rozpatrzenia, decyzja i jej uzasadnienie.',
      '**Podstawa prawna:** art. 6 ust. 1 lit. c RODO w związku z art. 16, 17 i 20 rozporządzenia (UE) 2022/2065 (DSA); art. 6 ust. 1 lit. f RODO – ustalenie, dochodzenie i obrona roszczeń.',
      '**Okres przechowywania:** przez czas rozpatrywania zgłoszenia i co najmniej 6 miesięcy od decyzji, w których można złożyć odwołanie, a następnie do upływu terminu przedawnienia roszczeń.',
    ],
  },

  { h3: 'Wiadomości e-mail związane z usługami' },
  {
    ul: [
      '**Dane:** adres e-mail, imię lub nazwa Firmy, informacje potrzebne w danej wiadomości.',
      '**Podstawa prawna:** art. 6 ust. 1 lit. b RODO – wiadomości niezbędne do świadczenia usług, takie jak potwierdzenie adresu e-mail, reset hasła, potwierdzenie Zapytania, przypomnienie o Wolnym terminie i decyzja moderacyjna; art. 6 ust. 1 lit. f RODO – prośba o Opinię.',
      '**Okres przechowywania:** jak dla usługi, której dotyczy wiadomość. Nie wysyłamy newslettera ani wiadomości marketingowych.',
    ],
  },

  { h3: 'Ochrona formularzy przed botami' },
  {
    ul: [
      '**Dane:** dane techniczne urządzenia i przeglądarki oraz adres IP, przetwarzane przez Cloudflare Turnstile w chwili wysyłania formularza.',
      '**Podstawa prawna:** art. 6 ust. 1 lit. f RODO – ochrona Serwisu i jego użytkowników przed spamem i automatycznymi nadużyciami.',
      '**Okres przechowywania:** na czas weryfikacji; nie zapisujemy tych danych w bazie Serwisu.',
    ],
  },

  { h3: 'Bezpieczeństwo i rejestr zdarzeń' },
  {
    ul: [
      '**Dane:** skrót adresu IP używany do limitów żądań, rejestr operacji w Serwisie (kto, kiedy i jaką operację wykonał – bez wartości danych osobowych), dane techniczne logowania.',
      '**Podstawa prawna:** art. 6 ust. 1 lit. f RODO – zapewnienie bezpieczeństwa i rozliczalności oraz ochrona przed nadużyciami.',
      '**Okres przechowywania:** liczniki limitów wygasają automatycznie po upływie okna czasowego limitu; rejestr operacji – przez czas niezbędny do wykrywania nadużyć i wykazania rozliczalności.',
    ],
  },

  { h3: 'Monitorowanie błędów' },
  {
    ul: [
      '**Dane:** dane techniczne o błędzie: adres podstrony, rodzaj przeglądarki i systemu, czas i przebieg błędu.',
      '**Podstawa prawna:** art. 6 ust. 1 lit. f RODO – zapewnienie poprawnego działania Serwisu.',
      '**Okres przechowywania:** przez czas potrzebny do analizy i usunięcia błędu, w granicach okresu retencji ustawionego w usłudze monitorowania.',
    ],
  },

  { h3: 'Statystyki odwiedzin bez cookies' },
  {
    ul: [
      '**Dane:** odwiedzona podstrona, źródło wejścia, kraj, rodzaj urządzenia i przeglądarki. Narzędzie Plausible nie używa cookies ani trwałych identyfikatorów i nie zapisuje adresu IP.',
      '**Podstawa prawna:** art. 6 ust. 1 lit. f RODO – analiza ruchu i rozwój Serwisu.',
      '**Okres przechowywania:** statystyki przechowujemy wyłącznie w postaci zbiorczej, która nie pozwala zidentyfikować osoby.',
    ],
  },
  {
    p: 'Firmy widzą w panelu zbiorcze statystyki swojego Profilu, takie jak liczba wyświetleń, kliknięć w numer telefonu i Zapytań, bez danych osób odwiedzających.',
  },

  { h3: 'Korespondencja' },
  {
    ul: [
      '**Dane:** dane podane w wiadomości.',
      '**Podstawa prawna:** art. 6 ust. 1 lit. f RODO – udzielenie odpowiedzi i obsługa sprawy.',
      '**Okres przechowywania:** przez czas prowadzenia korespondencji, a następnie do upływu terminu przedawnienia ewentualnych roszczeń.',
    ],
  },

  { h2: '3. Bezpieczeństwo danych' },
  {
    p: 'Dane kontaktowe z Zapytań, formularzy kalkulatorów i zgłoszeń szyfrujemy algorytmem AES-256-GCM, a wyszukiwanie po adresie e-mail odbywa się za pomocą jednokierunkowego skrótu. Adres IP zapisujemy wyłącznie w postaci skrótu, na potrzeby limitów żądań. Dane z Zapytania widzi tylko Firma, do której je wysłano, oraz upoważnione osoby po stronie Administratora. Konta personelu są chronione uwierzytelnianiem dwuskładnikowym. Połączenie z Serwisem jest szyfrowane, a z przesyłanych zdjęć usuwamy metadane, w tym informacje o miejscu wykonania zdjęcia.',
  },

  { h2: '4. Odbiorcy danych' },
  {
    p: 'Dane przechowujemy na serwerach w Europejskim Obszarze Gospodarczym. Korzystamy z dostawców, którzy przetwarzają dane w naszym imieniu na podstawie umów powierzenia przetwarzania:',
  },
  {
    ul: [
      'Vercel – hosting Serwisu (region Frankfurt);',
      'Neon – baza danych PostgreSQL (region Frankfurt);',
      'Cloudflare – przechowywanie plików (R2, UE) oraz ochrona formularzy przed botami (Turnstile);',
      'Upstash – obsługa limitów żądań (Redis, region UE);',
      'Brevo – wysyłka wiadomości e-mail;',
      'Sentry – monitorowanie błędów (region UE);',
      'Plausible – statystyki odwiedzin bez cookies (UE).',
    ],
  },
  {
    p: `Niektórzy dostawcy mają siedzibę lub podwykonawców poza EOG, w szczególności w USA. Jeżeli dochodzi do przekazania danych do państwa trzeciego, odbywa się ono na podstawie decyzji Komisji Europejskiej stwierdzającej odpowiedni stopień ochrony albo standardowych klauzul umownych przyjętych przez Komisję. Informacje o tych zabezpieczeniach przekażemy na prośbę wysłaną na adres ${mail(OPERATOR.privacyEmail)}.`,
  },
  {
    p: 'Odbiorcami danych są także: Firma, do której wysyłasz Zapytanie; użytkownicy Serwisu – w zakresie Treści publicznych (Profile, Opinie) albo dostępnych dla Firm (Forum, Giełda); organy publiczne – gdy wymagają tego przepisy prawa.',
  },

  { h2: '5. Zautomatyzowane podejmowanie decyzji' },
  {
    p: 'Nie podejmujemy wobec Ciebie decyzji opartych wyłącznie na zautomatyzowanym przetwarzaniu, w tym profilowaniu, które wywoływałyby skutki prawne lub w podobny sposób istotnie na Ciebie wpływały. Narzędzia automatyczne mogą jedynie wstrzymać wpis do sprawdzenia lub tymczasowo ukryć ogłoszenie po zgłoszeniach – decyzję rozstrzygającą zawsze podejmuje moderator. Kolejność wyników wyszukiwania zależy od Wolnego terminu i oceny Firmy, a nie od danych osoby, która je przegląda.',
  },

  { h2: '6. Twoje prawa' },
  { p: 'Na zasadach określonych w RODO masz prawo do:' },
  {
    ul: [
      'dostępu do danych i otrzymania ich kopii (art. 15 RODO);',
      'sprostowania danych (art. 16 RODO);',
      'usunięcia danych (art. 17 RODO);',
      'ograniczenia przetwarzania (art. 18 RODO);',
      'przenoszenia danych (art. 20 RODO) – Firma może samodzielnie pobrać swoje dane z panelu w formacie JSON, a także usunąć Konto Firmy w ustawieniach panelu;',
      'sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie (art. 21 RODO);',
      'wycofania zgody w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania dokonanego przed jej wycofaniem.',
    ],
  },
  {
    p: `Aby skorzystać z tych praw, napisz na adres ${mail(OPERATOR.privacyEmail)}. Odpowiemy w ciągu miesiąca; w uzasadnionych przypadkach termin ten może zostać przedłużony o kolejne dwa miesiące, o czym Cię poinformujemy. Możemy poprosić o informacje potwierdzające Twoją tożsamość.`,
  },
  {
    p: 'Masz prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa), jeżeli uważasz, że przetwarzamy Twoje dane niezgodnie z prawem.',
  },

  { h2: '7. Dobrowolność podania danych' },
  {
    p: 'Podanie danych jest dobrowolne, ale niezbędne do założenia Konta Firmy, wysłania Zapytania, wystawienia Opinii lub dokonania zgłoszenia – bez nich nie możemy świadczyć danej usługi. Numer telefonu w Zapytaniu jest opcjonalny. Zgoda na kontakt z formularza kalkulatora jest w pełni dobrowolna, a jej brak nie ogranicza korzystania z kalkulatora.',
  },

  { h2: '8. Pliki cookies' },
  {
    p: 'Pliki cookies to niewielkie pliki zapisywane w przeglądarce. Używamy wyłącznie cookies niezbędnych do działania Serwisu oraz do zapamiętania wybranego przez Ciebie motywu. Nie używamy cookies marketingowych, reklamowych ani śledzących, a statystyki odwiedzin zbieramy bez cookies.',
  },
  {
    table: {
      caption: 'Pliki cookies używane w Serwisie',
      header: ['Nazwa', 'Cel', 'Czas'],
      rows: [
        ['motyw', 'Zapamiętuje wybrany motyw: jasny lub ciemny.', '1 rok'],
        [
          'payload-token',
          'Utrzymuje zalogowanie do Konta Firmy albo konta personelu.',
          'Do wylogowania, najdłużej 30 dni (Konto Firmy) lub 8 godzin (personel)',
        ],
        [
          '__prerender_bypass',
          'Włącza podgląd nieopublikowanych treści – wyłącznie dla redakcji.',
          'Sesja',
        ],
        [
          'Cloudflare Turnstile',
          'Ochrona formularzy przed botami; dane techniczne zapisuje widżet ładowany z domeny challenges.cloudflare.com.',
          'Na czas weryfikacji',
        ],
      ],
    },
  },
  {
    p: 'Możesz usunąć lub zablokować cookies w ustawieniach przeglądarki. Zablokowanie cookies uniemożliwi zalogowanie do Konta Firmy, a bez cookie „motyw” Serwis wyświetli domyślny, jasny motyw.',
  },

  { h2: '9. Zmiany polityki' },
  {
    p: 'Politykę aktualizujemy, gdy zmieniają się przepisy, usługi lub dostawcy. Każda wersja ma numer i datę obowiązywania, a poprzednie wersje są dostępne w archiwum Serwisu. O istotnych zmianach informujemy Firmy e-mailem, a pozostałych użytkowników komunikatem w Serwisie. Ta wersja obowiązuje od 1 listopada 2026 r.',
  },
]

const reviews: DocPart[] = [
  {
    p: 'Opinie w Ekipie na Termin pochodzą wyłącznie od osób, które skontaktowały się z firmą przez nasz serwis. Poniżej wyjaśniamy, jak to sprawdzamy.',
  },
  { h2: 'Kto może wystawić opinię' },
  {
    p: 'Opinię może wystawić tylko osoba, która wysłała zapytanie do firmy przez formularz w serwisie. Po około dwóch tygodniach od wysłania zapytania dostaje e-mailem jednorazowy link do formularza opinii. Link jest ważny 30 dni i działa tylko raz – do jednego zapytania można dodać jedną opinię. Bez takiego linku nie da się wystawić opinii.',
  },
  {
    p: 'Link potwierdza, że autor rzeczywiście kontaktował się z firmą. Nie potwierdza, że firma wykonała dla niego prace, dlatego opinia może dotyczyć także samego kontaktu lub wyceny.',
  },
  { h2: 'Moderacja przed publikacją' },
  {
    p: 'Każdą opinię przed publikacją czyta moderator. Nie poprawiamy treści – opinię zatwierdzamy w całości albo odrzucamy. Odrzucamy opinie, które:',
  },
  {
    ul: [
      'zawierają wulgaryzmy, obelgi lub groźby;',
      'podają dane osobowe, np. nazwiska, adresy lub numery telefonów;',
      'nie dotyczą tej firmy ani kontaktu z nią;',
      'zawierają reklamę lub linki;',
      'noszą znamiona opinii pisanej na zlecenie albo przez konkurencję.',
    ],
  },
  {
    p: 'Opinię podpisujemy imieniem oraz dzielnicą lub miejscowością autora. Ocena firmy to średnia z opublikowanych opinii.',
  },
  { h2: 'Odpowiedź firmy i zgłoszenia' },
  {
    p: 'Firma może raz publicznie odpowiedzieć na opinię. Jeśli uważa, że opinia narusza prawo lub [Regulamin](/regulamin), może ją zgłosić przyciskiem „Zgłoś” – tak samo jak każdy inny użytkownik. Zgłoszenie sprawdza moderator, a decyzję przekazujemy z uzasadnieniem.',
  },
  { h2: 'Czego nie robimy' },
  {
    ul: [
      'Nie usuwamy negatywnych opinii na prośbę firmy. Opinię usuwamy tylko wtedy, gdy narusza prawo lub zasady serwisu.',
      'Nie przyjmujemy pieniędzy za opinie, za ich ukrycie ani za lepszą ocenę. Abonament firmy nie ma wpływu na opinie.',
      'Nie oferujemy nagród za wystawienie opinii.',
    ],
  },
]

const moderation: DocPart[] = [
  {
    p: 'Moderujemy treści, żeby profile, opinie, forum i giełda były wiarygodne i bezpieczne. Poniżej opisujemy, co sprawdzamy i jak podejmujemy decyzje. Wiążące zasady zawiera [Regulamin](/regulamin).',
  },
  { h2: 'Co sprawdzamy' },
  {
    ul: [
      '**Profile firm** – każdy przed publikacją: dane z rejestru, opis i zdjęcia realizacji.',
      '**Opinie** – każdą przed publikacją.',
      '**Forum** – pierwsze wpisy nowego konta, wpisy wstrzymane przez filtr słów i wpisy zgłoszone.',
      '**Giełdę** – pierwsze ogłoszenia firmy i ogłoszenia zgłoszone, w tym z podejrzeniem kradzieży.',
      '**Zgłoszenia** – wszystkie, które trafiają do nas przez przycisk „Zgłoś” lub e-mailem.',
    ],
  },
  { h2: 'Czego nie wolno publikować' },
  {
    ul: [
      'treści bezprawnych i naruszających prawa innych osób, w tym cudzych zdjęć;',
      'obelg, gróźb i mowy nienawiści;',
      'danych osobowych innych osób, np. adresów i telefonów klientów;',
      'nieprawdziwych opinii i fikcyjnych terminów;',
      'ofert przedmiotów z nieznanego lub nielegalnego źródła;',
      'spamu i reklam niezwiązanych z tematem.',
    ],
  },
  { h2: 'Jak podejmujemy decyzje' },
  {
    p: 'Decyzje podejmują moderatorzy, biorąc pod uwagę kontekst i wcześniejsze naruszenia autora. Filtry automatyczne mogą tylko wstrzymać wpis do sprawdzenia albo tymczasowo ukryć ogłoszenie, gdy trzy różne firmy zgłoszą podejrzenie kradzieży. Nigdy nie rozstrzygają same.',
  },
  {
    p: 'Jeśli ograniczymy Twoją treść lub konto, dostaniesz e-mail z uzasadnieniem: co zrobiliśmy, dlaczego, na jakiej podstawie i jak możesz się odwołać.',
  },
  { h2: 'Sankcje' },
  {
    p: 'Środki dobieramy do wagi naruszenia: ostrzeżenie, ukrycie lub usunięcie treści, czasowa blokada forum, giełdy albo całego konta. Przy poważnych lub powtarzających się naruszeniach możemy zakończyć współpracę z firmą.',
  },
  { h2: 'Odwołanie' },
  {
    p: `Od każdej decyzji możesz się odwołać w ciągu 6 miesięcy – przez link w e-mailu z decyzją lub pisząc na ${mail(OPERATOR.reportsEmail)}. Odwołanie rozpatruje człowiek. Jeśli przyznamy Ci rację, przywrócimy treść lub zdejmiemy blokadę.`,
  },
  { h2: 'Przycisk „Zgłoś”' },
  {
    p: 'Znajdziesz go przy profilu, opinii, wpisie na forum, ogłoszeniu i artykule. Krótko opisz, co jest nie tak. Jeśli nie masz konta, podaj adres e-mail – potwierdzimy przyjęcie zgłoszenia i poinformujemy Cię o decyzji.',
  },
]

const contact: DocPart[] = [
  { p: 'Masz pytanie o serwis, konto firmy albo swoje dane? Napisz do nas.' },
  {
    ul: [
      `**Sprawy ogólne i reklamacje:** ${mail(OPERATOR.email)}`,
      `**Dane osobowe:** ${mail(OPERATOR.privacyEmail)}`,
      `**Zgłoszenia treści i odwołania:** ${mail(OPERATOR.reportsEmail)}`,
    ],
  },
  {
    p: 'Firmy w sprawach konta, weryfikacji NIP i abonamentu piszą na adres ogólny – najlepiej z adresu e-mail przypisanego do konta. Treść naruszającą zasady najszybciej zgłosisz przyciskiem „Zgłoś” przy profilu, opinii lub ogłoszeniu. Na reklamacje dotyczące działania serwisu odpowiadamy w ciągu 14 dni. Nigdy nie prosimy o hasło – nie podawaj go w wiadomościach.',
  },
  { h2: 'Operator serwisu' },
  { p: `${operatorLine}.` },
  { h2: 'W czym nie pomożemy' },
  {
    p: 'Ekipa na Termin łączy klientów z firmami remontowymi. Nie wykonujemy remontów, nie wyceniamy prac i nie rozstrzygamy sporów o cenę, termin ani jakość prac. W takich sprawach skontaktuj się bezpośrednio z firmą. Jeśli jesteś konsumentem, możesz też poprosić o bezpłatną pomoc miejskiego lub powiatowego rzecznika konsumentów.',
  },
  { cta: { label: 'Szukam firmy', href: '/szukaj' } },
]

const about: DocPart[] = [
  {
    p: 'Ekipa na Termin to katalog firm remontowych z województwa łódzkiego, w którym od razu widać, kiedy firma może zacząć pracę.',
  },
  { h2: 'Najpierw termin' },
  {
    p: 'Przy remoncie jedno z pierwszych pytań brzmi: kiedy możecie zacząć? Dlatego każda firma pokazuje w wynikach i na profilu najbliższy wolny termin oraz datę, kiedy ostatnio go potwierdziła. Termin, którego firma nie potwierdza, po pewnym czasie wygasa – zamiast nieaktualnej daty zobaczysz wtedy „Zapytaj o termin”. Wyniki domyślnie układamy od najbliższego terminu.',
  },
  { h2: 'Sprawdzone firmy' },
  {
    p: 'Każda firma przechodzi weryfikację numeru NIP w publicznych rejestrach: CEIDG, KRS i wykazie podatników VAT. Na profilu widać, z którego rejestru pochodzą dane firmy. Profil trafia do katalogu dopiero po akceptacji moderatora, a firma pokazuje na nim zdjęcia własnych realizacji.',
  },
  { h2: 'Uczciwe opinie' },
  {
    p: 'Opinię może wystawić tylko osoba, która wysłała do firmy zapytanie przez serwis. Każdą czytamy przed publikacją, nie usuwamy niewygodnych opinii na prośbę firm i nie bierzemy pieniędzy za oceny. Szczegóły opisujemy na stronie [Jak sprawdzamy opinie](/jak-sprawdzamy-opinie).',
  },
  { h2: 'Jeden region' },
  {
    p: 'Działamy tylko w Łodzi i w województwie łódzkim. Dzięki temu w wynikach widzisz firmy, które pracują w Twojej okolicy, a nie ogłoszenia z drugiego końca Polski.',
  },
  { h2: 'Jak to działa' },
  {
    p: 'Dla klientów serwis jest bezpłatny. Firmy po 30 dniach okresu próbnego płacą abonament za obecność w katalogu, zapytania od klientów oraz dostęp do forum i giełdy dla firm. Łączymy strony, ale nie jesteśmy stroną umowy – szczegóły zlecenia ustalasz bezpośrednio z wybraną firmą.',
  },
  { cta: { label: 'Szukam firmy', href: '/szukaj' } },
  { cta: { label: 'Dodaj swoją firmę', href: '/rejestracja' } },
]

export const SEED_PAGES: SeedPage[] = [
  {
    slug: 'regulamin',
    title: 'Regulamin',
    legalKind: 'terms',
    legalVersion: '1.0',
    effectiveFrom: EFFECTIVE_FROM,
    parts: terms,
  },
  {
    slug: 'polityka-prywatnosci',
    title: 'Polityka prywatności',
    legalKind: 'privacy',
    legalVersion: '1.0',
    effectiveFrom: EFFECTIVE_FROM,
    parts: privacy,
  },
  { slug: 'jak-sprawdzamy-opinie', title: 'Jak sprawdzamy opinie', parts: reviews },
  { slug: 'zasady-moderacji', title: 'Zasady moderacji', parts: moderation },
  { slug: 'kontakt', title: 'Kontakt', parts: contact },
  { slug: 'o-nas', title: 'O nas', parts: about },
]
