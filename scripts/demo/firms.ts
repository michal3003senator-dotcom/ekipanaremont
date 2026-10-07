/**
 * Fikcyjne firmy demonstracyjne do lokalnej bazy demo: profile, realizacje i opinie.
 * Nazwy, osoby i historie są zmyślone. Administrator może je usunąć w panelu.
 */
export type PhotoKind =
  | 'bathroom'
  | 'tiles'
  | 'painting'
  | 'plaster'
  | 'drywall'
  | 'kitchen'
  | 'floor'
  | 'electrical'
  | 'plumbing'
  | 'windows'
  | 'carpentry'
  | 'roof'
  | 'facade'
  | 'brick'
  | 'renovation'

export type DemoProject = {
  title: string
  service: string
  locality: string
  /** 'RRRR-MM' */
  completedMonth: string
  description: string
  photoKind: PhotoKind
  photos: number
}

export type DemoReview = {
  rating: 1 | 2 | 3 | 4 | 5
  author: string
  body: string
  reply?: string
  daysAgo: number
}

export type DemoFirm = {
  name: string
  services: string[]
  baseLocality: string
  serviceArea: string[]
  shortDescription: string
  about: string[]
  yearsExperience: number
  teamSize: number
  warrantyMonths: 0 | 12 | 24 | 36 | 60
  vatInvoice: boolean
  /** Przesunięcie najbliższego wolnego terminu w dniach; null = termin ustalany indywidualnie. */
  availabilityDays: number | null
  projects: DemoProject[]
  reviews: DemoReview[]
}

export const DEMO_FIRMS: DemoFirm[] = [
  // 1
  {
    name: 'Kafel & Fuga Widzew',
    services: ['remont-lazienki', 'glazurnik', 'hydraulik'],
    baseLocality: 'lodz-widzew',
    serviceArea: ['lodz-widzew', 'lodz-srodmiescie', 'lodz-gorna', 'lodz', 'brzeziny'],
    shortDescription:
      'Łazienki pod klucz na Widzewie i w okolicy: skuwanie, nowa hydraulika, hydroizolacja, płytki wielkoformatowe. Jedna ekipa od demontażu do ostatniego silikonu, protokół odbioru i 3 lata gwarancji.',
    about: [
      'Zaczynaliśmy w 2012 roku we dwóch, od kładzenia płytek w blokach na Olechowie i Retkini. Dziś jest nas czworo: dwóch glazurników, hydraulik z uprawnieniami i Ania, która prowadzi kalendarz, zamawia materiał i odbiera telefony, kiedy my mamy ręce w kleju. Specjalizujemy się w łazienkach – od ciasnych, trzymetrowych łazienek w wielkiej płycie po przestronne łazienki w domach na Mileszkach i w Nowosolnej. Wszystko robimy w jednej ekipie, więc nie ma przerzucania winy między hydraulikiem a glazurnikiem, a klient rozmawia z tymi samymi ludźmi od wyceny do odbioru.',
      'Każda łazienka zaczyna się u nas od wizji lokalnej i dokładnego pomiaru. Sprawdzamy piony, stan instalacji, możliwe spadki i to, czy ściany w ogóle trzymają pion. Po wizycie dostajesz kosztorys rozpisany na etapy i materiały, a do tego rysunek rozkładu płytek na każdą ścianę, żeby jeszcze przed startem było widać, gdzie wypadną docinki i jak ułoży się fuga przy oknie czy wnęce. Nie lubimy niespodzianek, więc kiedy po skuciu płytek wychodzi coś, czego nie było widać – skorodowana rura w ścianie albo pusta przestrzeń pod starą wanną – dzwonimy, wysyłamy zdjęcie i ustalamy dopłatę, zanim zrobimy cokolwiek dalej.',
      'Na budowie pilnujemy porządku, bo zwykle pracujemy w zamieszkanych mieszkaniach. Drogę od drzwi do łazienki zabezpieczamy folią ochronną i tekturą, drzwi do pokoi oklejamy taśmą, a płytki tniemy na mokro albo pod odkurzaczem przemysłowym klasy M. Gruz wynosimy w workach na bieżąco, a sąsiadom z pionu zostawiamy na klatce kartkę z harmonogramem głośnych prac. Skuwanie robimy wyłącznie w godzinach 9–17, a po każdym dniu odkurzamy przedpokój.',
      'Hydroizolację robimy zawsze w dwóch warstwach, z taśmami w narożnikach i mankietami na przejściach rur – również tam, gdzie klient mówi, że „i tak będzie wanna”. Pracujemy na klejach i fugach Mapei oraz Atlas, a przy płytkach 120×60 i większych używamy systemu poziomowania i kleju o pełnym podparciu. Odpływy liniowe montujemy z fabrycznym kołnierzem uszczelniającym. Przed zamknięciem ścian robimy próbę szczelności instalacji i zostawiamy klientowi zdjęcia rozprowadzenia rur, żeby za kilka lat było wiadomo, gdzie wolno wiercić.',
      'Co kilka dni wysyłamy zdjęcia postępu prac na WhatsAppa albo e-mailem – to szczególnie przydatne, gdy klient na czas remontu mieszka u rodziny. Typowa łazienka 4–6 m² zajmuje nam od 12 do 16 dni roboczych, łącznie z czasem schnięcia wylewki i hydroizolacji. Tych przerw nie skracamy, nawet jeśli ktoś bardzo prosi, bo to one decydują o tym, czy płytki będą trzymać za dziesięć lat.',
      'Klienci często pytają nas o materiały, więc pomagamy je wybrać, ale nie narzucamy sklepu. Możemy pojechać razem do hurtowni na Widzewie albo sprawdzić płytki kupione przez internet, zanim kurier odjedzie – kaliber, odcień i ewentualne pęknięcia w kartonach. Przy odpływach doradzamy rozwiązania, które łatwo wyczyścić, a przy fugach – kolor o pół tonu ciemniejszy od płytki, bo w łazience po prostu lepiej się starzeje. Jeśli łazienka jest bardzo mała, rysujemy dwa albo trzy warianty ustawienia ceramiki, bo czasem przesunięcie WC o 15 cm daje miejsce na szafkę albo pralkę. Po odbiorze zostawiamy kilka zapasowych płytek z tej samej partii, opisanych i zapakowanych – na wypadek, gdyby kiedyś trzeba było wymienić jedną pękniętą.',
      'Nie robimy elektryki poza przełożeniem gniazdek i oświetlenia w samej łazience – przy większym zakresie polecamy sprawdzonego elektryka z Górnej. Nie kładziemy płytek na stare płytki i nie montujemy wanien z hydromasażem bez dostępu serwisowego. Na koniec spisujemy protokół odbioru, przechodzimy z klientem punkt po punkcie i dajemy 36 miesięcy gwarancji na robociznę, w tym na szczelność. Fakturę VAT wystawiamy zawsze.',
    ],
    yearsExperience: 14,
    teamSize: 4,
    warrantyMonths: 36,
    vatInvoice: true,
    availabilityDays: 12,
    projects: [
      {
        title: 'Łazienka 4,5 m² w bloku na Olechowie',
        service: 'remont-lazienki',
        locality: 'lodz-widzew',
        completedMonth: '2026-05',
        description:
          'Pełny remont łazienki w wielkiej płycie: skucie lastryko i starych płytek, nowe podejścia wodne w ścianie, wylewka ze spadkiem pod prysznic bez brodzika i odpływ liniowy 70 cm. Na ścianach i podłodze płytki 120×60 w kolorze ciepłego betonu, w strefie prysznica fuga epoksydowa. Prace trwały 14 dni roboczych. Ciekawostka: pralkę przenieśliśmy do wnęki po starym bojlerze, dzięki czemu zmieściła się szafka pod umywalkę o szerokości 80 cm.',
        photoKind: 'bathroom',
        photos: 3,
      },
      {
        title: 'Łazienka z wanną wolnostojącą, dom w Nowosolnej',
        service: 'remont-lazienki',
        locality: 'lodz-widzew',
        completedMonth: '2025-10',
        description:
          'Łazienka 9 m² na piętrze domu jednorodzinnego: wanna wolnostojąca z baterią podłogową, prysznic walk-in ze ścianką 120 cm i dwie umywalki na blacie z konglomeratu. Wymieniliśmy pękniętą rurę spustową pod podłogą, wykonaliśmy hydroizolację w dwóch warstwach i położyliśmy płytki 60×120 w jodełkę na ścianie za wanną. Całość zajęła 18 dni roboczych, a klient dostał zdjęcia wszystkich rur przed zamknięciem ścian.',
        photoKind: 'bathroom',
        photos: 3,
      },
      {
        title: 'Płytki w kuchni i przedpokoju, 22 m², Śródmieście',
        service: 'glazurnik',
        locality: 'lodz-srodmiescie',
        completedMonth: '2025-06',
        description:
          'Gres 60×60 w przedpokoju i kuchni mieszkania w kamienicy, układany bez progu między pomieszczeniami. Najpierw wyrównaliśmy stary strop cienką wylewką samopoziomującą, potem położyliśmy płytki z fugą 2 mm w kolorze płytki. Nad blatem kuchennym ułożyliśmy płytki 7,5×30 w cegiełkę. Prace trwały 6 dni, a jedynym kompromisem był wąski docinek przy drzwiach balkonowych, uzgodniony z klientką na rysunku przed startem.',
        photoKind: 'tiles',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Kasia, Olechów',
        body: 'Ekipa zrobiła nam łazienkę w 15 dni roboczych, dokładnie tak, jak było w harmonogramie. Codziennie po pracy porządek, folia od drzwi do łazienki, nawet sąsiadka z dołu nie narzekała 😊 Płytki 120×60 położone równo jak stół. Polecam z czystym sumieniem 👍',
        reply:
          'Dziękujemy, Pani Kasiu! Cieszymy się, że sąsiadka też jest zadowolona 🙂 Gdyby po pierwszych tygodniach coś działo się z silikonem przy prysznicu, prosimy o telefon – poprawimy w ramach gwarancji.',
        daysAgo: 34,
      },
      {
        rating: 5,
        author: 'Marek, Nowosolna',
        body: 'Robili u nas łazienkę na piętrze domu, z wanną wolnostojącą i prysznicem. Przed startem dostaliśmy rysunek rozkładu płytek na każdą ścianę, więc nie było dyskusji, gdzie wypadną docinki. Po skuciu okazało się, że stara rura spustowa jest pęknięta pod podłogą – zadzwonili, pokazali zdjęcia, ustaliliśmy dopłatę i dopiero wtedy ruszyli dalej. Na koniec przeszliśmy razem całą łazienkę z protokołem odbioru i dostaliśmy zdjęcia wszystkich rur w ścianach. Tak powinna wyglądać praca fachowców.',
        daysAgo: 190,
      },
      {
        rating: 4,
        author: 'Ola, Śródmieście',
        body: 'Płytki w kuchni i przedpokoju wyglądają świetnie, fugi równe, listwy przycięte co do milimetra. Jedna gwiazdka mniej, bo start przesunął się o tydzień – ale uprzedzili mnie z wyprzedzeniem i wyjaśnili dlaczego. Solidna firma ✅',
        reply:
          'Dziękujemy za opinię! Przesunięcie wynikało z dłuższego schnięcia wylewki u poprzedniego klienta. Staramy się nie skracać tych przerw, nawet kosztem kalendarza.',
        daysAgo: 120,
      },
      {
        rating: 5,
        author: 'Tomek, Stoki',
        body: 'Konkretni ludzie. Wycena na miejscu, harmonogram na kartce, zdjęcia postępu co dwa dni na WhatsAppie. Łazienka 🛁 jak z katalogu, a odpływ liniowy wreszcie odprowadza wodę, zamiast robić kałużę 🔥',
        daysAgo: 75,
      },
    ],
  },
  // 2
  {
    name: 'Malarnia Pod Kluczem',
    services: ['malarz', 'tynkarz'],
    baseLocality: 'lodz-polesie',
    serviceArea: [
      'lodz-polesie',
      'lodz-srodmiescie',
      'lodz-baluty',
      'konstantynow-lodzki',
      'aleksandrow-lodzki',
    ],
    shortDescription:
      'Malowanie mieszkań i klatek schodowych, gładzie bezpyłowe, tapety i farby dekoracyjne. Trzyosobowa ekipa z Polesia, która przed malowaniem zawsze szpachluje i szlifuje ściany pod światło.',
    about: [
      'Malarnię Pod Kluczem założył w 2017 roku Paweł Wróblewski, który wcześniej przez kilka lat malował wnętrza w nowych inwestycjach na Teofilowie i Retkini. Jak sam mówi, miał dość pracy na akord, w której nikt nie patrzy na ściany pod światło. Dziś firma to trzy osoby: Paweł, jego brat Krzysztof i Monika, która specjalizuje się w tapetach i farbach dekoracyjnych. Pracują głównie na Polesiu, w Śródmieściu i na Bałutach, ale chętnie jeżdżą też do Konstantynowa i Aleksandrowa.',
      'Nazwa nie jest przypadkowa: ekipa przejmuje mieszkanie „pod klucz”. Klient zostawia klucze, a malarze sami przesuwają meble na środek pokoju, owijają je folią, zdejmują zasłony, karnisze i kratki wentylacyjne, a po robocie wszystko wraca na swoje miejsce. Podłogi zabezpieczają tekturą falistą przyklejoną taśmą malarską do listew, bo zwykła folia na panelach się przesuwa i rwie. Gniazdka i włączniki są zdejmowane, a nie oklejane – dzięki temu farba nie zostaje w szczelinach przy puszkach.',
      'Największy nacisk firma kładzie na przygotowanie podłoża, bo to ono decyduje o efekcie. Ściany są oglądane pod lampą bocznego światła, rysy poszerzane i zbrojone siatką, a gładź szlifowana szlifierką typu żyrafa podłączoną do odkurzacza przemysłowego. W praktyce w mieszkaniu prawie nie ma pyłu, co doceniają zwłaszcza rodziny z małymi dziećmi i alergicy. Przed malowaniem zawsze nakładany jest grunt dobrany do podłoża – inny na płytę gipsową, inny na stary tynk wapienny w kamienicy.',
      'Ekipa maluje najczęściej farbami lateksowymi Tikkurila, Beckers i Magnat, a w kuchniach i przedpokojach poleca farby ceramiczne odporne na szorowanie. Klient dostaje próbki kolorów pomalowane na ścianie w kilku miejscach, bo kolor z wzornika potrafi wyglądać zupełnie inaczej przy oknie od północy. Monika pomaga dobrać odcienie i układ tapet, a przy farbach dekoracyjnych – betonowych, lnianych czy metalicznych – robi najpierw próbną płytę, którą można obejrzeć w domu przez kilka dni.',
      'Typowe zlecenia to odświeżenie mieszkania 40–60 m² przed wprowadzeniem się albo po wyprowadzce najemców, malowanie klatek schodowych dla wspólnot i renowacja ścian w kamienicach na Polesiu, gdzie trzeba poradzić sobie z łuszczącą się farbą klejową i spękanym tynkiem. Mieszkanie dwupokojowe ze szpachlowaniem zajmuje zwykle od 5 do 7 dni roboczych. Klient codziennie dostaje krótką wiadomość, co zostało zrobione, i zdjęcie z postępu prac.',
      'Malarnia ma też swoje drobne rytuały, które klienci zapamiętują. Na początku każdej pracy Paweł spisuje z klientem, co ma zostać zdjęte, a co zostaje na ścianach – obrazy, półki, haczyki – i robi zdjęcia, żeby po malowaniu wszystko wróciło dokładnie tam, gdzie było. Otwory po kołkach, które przestały być potrzebne, są szpachlowane, a pozostałe oznaczane. Resztki farby z każdego koloru trafiają do opisanego słoika z nazwą odcienia i datą, żeby za rok dało się zrobić drobną poprawkę bez szukania wzornika. Przy klatkach schodowych ekipa uzgadnia z zarządcą godziny pracy i wywiesza informację z harmonogramem na każdym piętrze, a lamperię maluje farbą, którą da się zmywać bez śladów.',
      'Firma nie maluje elewacji, nie pracuje na wysokości powyżej drugiego poziomu rusztowania i nie maluje natryskowo w zamieszkanych mieszkaniach. Jeśli po zdjęciu starej farby wychodzi wilgoć albo grzyb, prace są wstrzymywane do czasu znalezienia przyczyny – malowanie mokrej ściany to wyrzucanie pieniędzy. Na koniec jest wspólny obchód z lampą, lista ewentualnych poprawek i protokół odbioru. Gwarancja wynosi 24 miesiące, a faktura VAT jest wystawiana przy każdym zleceniu.',
    ],
    yearsExperience: 9,
    teamSize: 3,
    warrantyMonths: 24,
    vatInvoice: true,
    availabilityDays: 5,
    projects: [
      {
        title: 'Malowanie i gładzie w mieszkaniu 52 m² na Retkini',
        service: 'malarz',
        locality: 'lodz-polesie',
        completedMonth: '2026-03',
        description:
          'Mieszkanie po najemcach: zerwanie tapety w przedpokoju, naprawa ubytków po kołkach, gładź polimerowa na wszystkich ścianach i sufitach, szlifowanie bezpyłowe i dwukrotne malowanie. W salonie ciepła szarość, w sypialni przygaszony błękit, w kuchni farba ceramiczna. Prace trwały 6 dni roboczych. Klientka mieszkała w tym czasie poza Łodzią, więc codziennie dostawała zdjęcia, a klucze odebrała w dniu odbioru.',
        photoKind: 'painting',
        photos: 3,
      },
      {
        title: 'Renowacja ścian w kamienicy, 3 pokoje w Śródmieściu',
        service: 'tynkarz',
        locality: 'lodz-srodmiescie',
        completedMonth: '2025-09',
        description:
          'Wysokie na 3,4 m pokoje w kamienicy z początku XX wieku, z kilkoma warstwami farby klejowej i siatką rys na tynku wapiennym. Usunęliśmy starą farbę do gołego tynku, uzupełniliśmy ubytki zaprawą wapienną, zazbroiliśmy rysy siatką i położyliśmy gładź. Sztukaterie przy suficie zostały oczyszczone pędzlem i pomalowane osobno. Całość zajęła 12 dni roboczych, w tym 2 dni na schnięcie zapraw.',
        photoKind: 'plaster',
        photos: 2,
      },
      {
        title: 'Klatka schodowa, 4 piętra, Konstantynów Łódzki',
        service: 'malarz',
        locality: 'konstantynow-lodzki',
        completedMonth: '2025-05',
        description:
          'Malowanie klatki schodowej w czteropiętrowym bloku na zlecenie wspólnoty. Naprawa pęknięć przy biegach schodów, nowa lamperia z farby lateksowej odpornej na szorowanie zamiast olejnej i jasna farba na ścianach powyżej. Pracowaliśmy piętrami, tak żeby mieszkańcy mogli normalnie chodzić, a każde piętro było gotowe w półtora dnia. Cała klatka zajęła 7 dni roboczych.',
        photoKind: 'painting',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Agnieszka, Retkinia',
        body: 'Pierwszy raz zostawiłam komuś klucze i wróciłam do gotowego mieszkania 🎨 Meble na swoich miejscach, podłogi czyste, ściany gładkie jak szkło. Pan Paweł codziennie przysyłał zdjęcia, więc wiedziałam, co się dzieje. Polecam!',
        reply: 'Dziękujemy, Pani Agnieszko! Takie mieszkanie to przyjemność malować 🙂',
        daysAgo: 21,
      },
      {
        rating: 5,
        author: 'Robert, Polesie',
        body: 'Kamienica, stare tynki, farba klejowa w kilku warstwach i rysy na każdej ścianie. Dwie inne ekipy chciały od razu „położyć gładź na wszystko”. Tutaj najpierw zeskrobali starą farbę, zazbroili rysy siatką, dali odpowiedni grunt i dopiero wtedy gładź. Minęło pół roku i nie ma ani jednej rysy. Pani Monika pomogła też wybrać kolory – w pokoju od północy wybraliśmy cieplejszy odcień, niż planowałem, i to był strzał w dziesiątkę.',
        daysAgo: 230,
      },
      {
        rating: 3,
        author: 'Iwona, Bałuty',
        body: 'Ściany pomalowane ładnie, ale na jednej po tygodniu wyszły przebarwienia przy oknie. Firma przyjechała poprawić bez dyskusji, tylko musiałam czekać prawie trzy tygodnie, bo mieli inne zlecenie. Efekt końcowy dobry, organizacja do poprawy.',
        reply:
          'Pani Iwono, dziękujemy za szczerą opinię. Przebarwienie wynikało z zawilgocenia przy nieszczelnym parapecie, ale czas oczekiwania na poprawkę był zdecydowanie za długi. Zmieniliśmy kalendarz tak, żeby jeden dzień w tygodniu był zawsze wolny na poprawki 🙏',
        daysAgo: 150,
      },
      {
        rating: 4,
        author: 'Halina, Konstantynów',
        body: 'Klatka odnowiona, sąsiedzi zadowoleni 😊 Malowali piętrami, więc dało się normalnie chodzić, a każdego dnia było posprzątane. Minus za zapach farby przez kilka dni, ale chyba nie dało się tego uniknąć.',
        daysAgo: 365,
      },
    ],
  },
  // 3
  {
    name: 'Pracownia Remontowa Nowak i Syn',
    services: ['remont-mieszkania', 'malarz', 'sucha-zabudowa', 'posadzki'],
    baseLocality: 'lodz-baluty',
    serviceArea: ['lodz-baluty', 'lodz', 'zgierz', 'ozorkow', 'aleksandrow-lodzki'],
    shortDescription:
      'Rodzinna firma z Bałut: kompleksowe remonty mieszkań w blokach i kamienicach – od wyburzeń, przez instalacje i zabudowy G-K, po malowanie. Każde zlecenie ma własny harmonogram i folder ze zdjęciami.',
    about: [
      'Firmę założył w 2004 roku Jerzy Nowak, który wcześniej pracował jako brygadzista w łódzkim przedsiębiorstwie budowlanym. Od 2015 roku prowadzimy ją razem z synem, Mateuszem, inżynierem budownictwa. Mamy sześcioosobową ekipę złożoną z ludzi, którzy pracują z nami od lat – najdłużej pan Zbyszek, nasz tynkarz i specjalista od zabudów, który jest z nami od samego początku. Większość zleceń realizujemy na Bałutach, Teofilowie i Radogoszczu, a także w Zgierzu i Ozorkowie, skąd pochodzi część zespołu.',
      'Specjalizujemy się w kompleksowych remontach mieszkań – takich, po których z poprzedniego wnętrza zostają tylko ściany nośne i okna. Najczęściej trafiają do nas osoby, które kupiły mieszkanie z rynku wtórnego w bloku z lat 70. albo w kamienicy i chcą wszystko zrobić raz, a porządnie. Koordynujemy cały proces: wyburzenia, nowe instalacje elektryczne i wodne (z zaprzyjaźnionymi instalatorami z uprawnieniami), wylewki, zabudowy z płyt gipsowo-kartonowych, gładzie, malowanie, montaż drzwi i listew.',
      'Przed startem każdy klient dostaje harmonogram w formie tabeli – tydzień po tygodniu, z zaznaczonymi momentami, w których trzeba podjąć decyzje, na przykład wybrać płytki albo kolor ścian. Mateusz prowadzi dla każdej budowy wspólny folder ze zdjęciami postępu prac, w którym na bieżąco pojawiają się fotografie instalacji przed zakryciem. To bardzo się przydaje, kiedy po latach trzeba powiesić szafkę albo dołożyć gniazdko i trzeba wiedzieć, gdzie biegną przewody.',
      'Przy starych blokach i kamienicach niespodzianki to norma: krzywe stropy, przewody aluminiowe, zamurowane kanały wentylacyjne, belki stropowe naruszone przez wilgoć. Mamy na to prostą zasadę – nic nie zakrywamy, dopóki klient nie zobaczy problemu i nie zaakceptuje rozwiązania. W kosztorysie od razu zostawiamy rezerwę 10–15 procent i uczciwie o niej mówimy. Jeżeli nie zostanie wykorzystana, nie pojawia się na fakturze.',
      'Pracujemy na sprawdzonych materiałach: płyty Knauf i Rigips na profilach ocynkowanych, wylewki samopoziomujące Atlas, gładzie polimerowe, farby Tikkurila i Dulux. Na budowie używamy odkurzaczy przemysłowych podpiętych do elektronarzędzi, a jeśli remontujemy tylko część mieszkania, a w reszcie ktoś mieszka, stawiamy ściany pyłowe z folii z zamkiem błyskawicznym. Odpady wywozimy własnym transportem, a przed wejściem na klatkę kładziemy matę, żeby nie roznosić kurzu po budynku.',
      'Wiele osób pyta, czy może mieszkać w trakcie remontu. Odpowiadamy szczerze: przy pełnym remoncie odradzamy, ale jeśli nie ma innego wyjścia, dzielimy prace na strefy i zawsze zostawiamy jedno pomieszczenie oraz działającą łazienkę albo przynajmniej WC. Mateusz rozpisuje wtedy kolejność tak, żeby najbardziej pylące etapy – skuwanie, szlifowanie gładzi, cięcie płytek – wypadały w dniach, kiedy domownicy mogą być poza domem. Starszym klientom pomagamy też w sprawach, które nie są stricte budowlane: zamówieniu kontenera, zgłoszeniu prac w spółdzielni, przeniesieniu mebli do piwnicy czy odbiorze materiałów z hurtowni. Wiemy, że remont to stres, i staramy się go nie dokładać.',
      'Nie robimy remontów „na szybko” w tydzień ani prac bez umowy. Nie bierzemy też drobnych pojedynczych zleceń w rodzaju wymiany jednego gniazdka – po prostu nie dalibyśmy rady obsłużyć ich dobrze przy większych budowach. Typowy remont mieszkania 50 m² trwa u nas od 7 do 10 tygodni. Kończymy go protokołem odbioru z listą usterek do poprawy, a gwarancja na wykonane prace wynosi 24 miesiące.',
    ],
    yearsExperience: 22,
    teamSize: 6,
    warrantyMonths: 24,
    vatInvoice: true,
    availabilityDays: 28,
    projects: [
      {
        title: 'Mieszkanie 48 m² w bloku z lat 70. na Teofilowie – remont od zera',
        service: 'remont-mieszkania',
        locality: 'lodz-baluty',
        completedMonth: '2026-02',
        description:
          'Mieszkanie w stanie oryginalnym: przewody aluminiowe, piecyk gazowy w łazience, lastryko w przedpokoju. Wyburzyliśmy ściankę między kuchnią a pokojem, wymieniliśmy instalacje, wyrównaliśmy krzywy o 3 cm strop w kuchni płytą na ruszcie, wykonaliśmy wylewki, gładzie, malowanie, łazienkę i montaż drzwi. Remont trwał 9 tygodni i 2 dni, a z rezerwy w kosztorysie wykorzystaliśmy niecałą połowę.',
        photoKind: 'renovation',
        photos: 3,
      },
      {
        title: 'Zabudowa G-K i nowy układ pokoi, 64 m², Zgierz',
        service: 'sucha-zabudowa',
        locality: 'zgierz',
        completedMonth: '2025-07',
        description:
          'Zmiana układu mieszkania z dwóch dużych pokoi na trzy mniejsze: dwie nowe ścianki działowe na profilach 75 mm z wełną akustyczną, wzmocnienia pod szafki i telewizor zaznaczone na zdjęciach, nowe otwory drzwiowe. Do tego sufit podwieszany w przedpokoju z oświetleniem LED i obudowa pionu w łazience z rewizją. Zabudowy zajęły 8 dni roboczych, gładzie i malowanie – kolejne 6.',
        photoKind: 'drywall',
        photos: 3,
      },
      {
        title: 'Wylewki i przygotowanie podłóg w kamienicy w Ozorkowie',
        service: 'posadzki',
        locality: 'ozorkow',
        completedMonth: '2025-04',
        description:
          'Mieszkanie 70 m² na pierwszym piętrze kamienicy z drewnianym stropem. Po zerwaniu starych desek wymieniliśmy dwa zbutwiałe legary, położyliśmy płyty OSB na nowym ruszcie, a w kuchni i łazience – lekką wylewkę na matach rozdzielających. Różnica poziomów między pomieszczeniami wynosiła 4 cm, po pracach całe mieszkanie jest na jednym poziomie bez progów. Całość zajęła 11 dni roboczych.',
        photoKind: 'floor',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Ewa, Teofilów',
        body: 'Kupiliśmy mieszkanie w stanie oryginalnym z lat 70. – aluminium w ścianach, piecyk gazowy w łazience. Pan Mateusz przygotował harmonogram na 9 tygodni i skończyli w 9 tygodni i 2 dni. Każdy etap był pokazany na zdjęciach we wspólnym folderze, a kiedy wyszło, że strop w kuchni jest krzywy o 3 cm, dostaliśmy dwie opcje do wyboru z cenami. Rezerwa w kosztorysie została wykorzystana tylko w połowie i reszta rzeczywiście nie pojawiła się na fakturze. Polecam każdemu, kto boi się remontu.',
        reply:
          'Pani Ewo, dziękujemy za zaufanie i cierpliwość przy tym stropie. Życzymy wielu dobrych lat w nowym mieszkaniu!',
        daysAgo: 58,
      },
      {
        rating: 5,
        author: 'Michał, Radogoszcz',
        body: 'Ścianki z płyt, nowe drzwi, gładzie, malowanie – wszystko porządnie i w terminie 💪 Pan Zbyszek to złota rączka, którą każdy chciałby mieć w rodzinie. Polecam 👍',
        daysAgo: 140,
      },
      {
        rating: 4,
        author: 'Joanna, Zgierz',
        body: 'Bardzo dobra jakość wykonania i porządek na budowie. Raz w tygodniu przyjeżdżał pan Jerzy i wszystko sprawdzał. Odejmuję gwiazdkę za drobne opóźnienie przy montażu drzwi, ale to akurat wina dostawcy, nie ekipy.',
        daysAgo: 260,
      },
      {
        rating: 2,
        author: 'Krzysztof, Bałuty',
        body: 'Jakość prac w porządku, ale remont trwał prawie trzy tygodnie dłużej, niż zakładał harmonogram. Część opóźnienia wynikała ze stanu instalacji, którego nikt nie mógł przewidzieć, ale przez kilka dni nikt nie pojawiał się na budowie i musiałem sam dzwonić, żeby dowiedzieć się, co się dzieje. Przy takiej cenie oczekuję lepszej komunikacji.',
        reply:
          'Panie Krzysztofie, ma Pan rację co do komunikacji i przepraszamy. Przerwa wynikała z oczekiwania na decyzję spółdzielni w sprawie pionu, ale powinniśmy byli informować Pana o tym codziennie, a nie czekać na telefon. Od tamtej pory każdy przestój zgłaszamy klientowi tego samego dnia.',
        daysAgo: 310,
      },
      {
        rating: 5,
        author: 'Beata, Ozorków',
        body: 'Podłogi w starej kamienicy – trudna robota, a zrobiona bez jednego problemu 😊 Wymienili zbutwiałe legary, o których nie miałam pojęcia. Dziękuję za cierpliwość do moich pytań 🙏',
        daysAgo: 380,
      },
    ],
  },
  // 4
  {
    name: 'Łazienki od Ręki – Piotrków',
    services: ['remont-lazienki', 'glazurnik'],
    baseLocality: 'piotrkow-trybunalski',
    serviceArea: ['piotrkow-trybunalski', 'belchatow', 'tomaszow-mazowiecki', 'radomsko'],
    shortDescription:
      'Łazienki pod klucz w Piotrkowie, Bełchatowie, Tomaszowie i Radomsku. Projekt rozkładu płytek każdej ściany, dziennik budowy ze zdjęciami i 36 miesięcy gwarancji na robociznę.',
    about: [
      'Łazienki od Ręki to trzyosobowa ekipa z Piotrkowa Trybunalskiego, którą prowadzi Dariusz Kubiak, glazurnik z ponad dziesięcioletnim stażem, w tym kilkoma latami pracy w Niemczech przy wykończeniach hoteli. Stamtąd przywiózł nawyk, który dziś jest znakiem rozpoznawczym firmy: każdy etap prac jest dokumentowany i odbierany, zanim zacznie się kolejny. Firma działa w Piotrkowie, Bełchatowie, Tomaszowie Mazowieckim i Radomsku, czyli wszędzie tam, gdzie da się dojechać rano w niecałą godzinę.',
      'Nazwa bywa myląca – „od ręki” nie znaczy „na szybko”. Chodzi o to, że klient nie musi niczego koordynować sam. Ekipa robi demontaż, hydraulikę, hydroizolację, płytki, montaż ceramiki i armatury, a także sufit podwieszany z oświetleniem. Jeśli trzeba poprowadzić nowy obwód elektryczny, na jeden dzień dołącza elektryk z uprawnieniami, z którym firma współpracuje od lat. Klient ma jeden numer telefonu i jedną osobę odpowiedzialną za całość.',
      'Przed rozpoczęciem prac Dariusz przygotowuje projekt rozkładu płytek w programie do wizualizacji, z widokiem każdej ściany. Na tej podstawie wylicza materiał z zapasem 10 procent i pomaga go zamówić w piotrkowskich hurtowniach, w których firma ma rabaty. Płytki odbierane są przez ekipę i sprawdzane pod kątem odcienia i kalibru jeszcze przed wniesieniem do mieszkania. Zdarzyło się już kilka razy, że dzięki temu udało się wymienić wadliwą partię, zanim ktokolwiek przykleił pierwszą płytkę.',
      'W trakcie prac firma prowadzi dla klienta krótki dziennik budowy ze zdjęciami: stan po skuciu, rozprowadzenie rur, próba szczelności, hydroizolacja przed płytkami. Te zdjęcia trafiają do klienta razem z protokołem odbioru. Do hydroizolacji stosowane są masy dwuskładnikowe, a w strefie prysznica dodatkowo maty uszczelniające. Pod prysznicami bez brodzika spadek wykonywany jest w wylewce, a nie w kleju – to zasada, od której ekipa nie robi wyjątków.',
      'Mieszkania w blokach to codzienność, ale coraz częściej firma robi też łazienki w domach jednorodzinnych pod Bełchatowem i Tomaszowem, z oknami dachowymi, skosami i ogrzewaniem podłogowym. Przy takich pracach ekipa dba o porządek tak samo jak w bloku: folia ochronna na schodach, odkurzacz przemysłowy przy szlifowaniu i cięciu, codzienne sprzątanie. Klienci często zostawiają klucze i przyjeżdżają tylko na odbiory kolejnych etapów.',
      'Dariusz chętnie doradza także przy wyborze ceramiki i armatury, ale nie bierze prowizji od sklepów, więc nie ma powodu, by namawiać na droższe rozwiązania. Często odradza rzeczy modne, które słabo sprawdzają się na co dzień: bardzo ciemne płytki na podłodze przy twardej wodzie, odpływy punktowe w dużych prysznicach czy szafki stojące tuż przy posadzce w strefie mokrej. Zamiast tego proponuje rozwiązania, które łatwo utrzymać w czystości – wnęki na kosmetyki zamiast półek, fugi epoksydowe w prysznicu i podwieszaną ceramikę, pod którą da się umyć podłogę. Po zakończeniu prac klienci dostają krótką instrukcję pielęgnacji fug i silikonów oraz przypomnienie o impregnacji po pół roku.',
      'Firma nie kładzie płytek na płytki, nie montuje kabin bez wcześniejszego sprawdzenia pionów ścian i nie robi łazienek w terminie krótszym niż 10 dni roboczych, bo nie da się wtedy zachować czasów schnięcia. Najbliższy wolny termin bywa odległy, bo kalendarz zapełnia się na kilka tygodni do przodu, ale raz ustalona data jest dotrzymywana. Gwarancja na robociznę wynosi 36 miesięcy, a faktura VAT jest standardem.',
    ],
    yearsExperience: 11,
    teamSize: 3,
    warrantyMonths: 36,
    vatInvoice: true,
    availabilityDays: 40,
    projects: [
      {
        title: 'Łazienka 5 m² z prysznicem walk-in, blok w Piotrkowie',
        service: 'remont-lazienki',
        locality: 'piotrkow-trybunalski',
        completedMonth: '2026-07',
        description:
          'Wanna zamieniona na prysznic walk-in 120×90 ze szklaną ścianką, odpływ liniowy przy ścianie i wylewka ze spadkiem 2%. Płytki 60×120 w kolorze piaskowca, na ścianie prysznica pionowe pasy mozaiki. WC podwieszane na stelażu z półką z płytek nad spłuczką. Prace trwały 13 dni roboczych, a klient dostał dziennik budowy z 40 zdjęciami, w tym z próby szczelności i hydroizolacji.',
        photoKind: 'bathroom',
        photos: 3,
      },
      {
        title: 'Łazienka na poddaszu ze skosami, dom pod Bełchatowem',
        service: 'remont-lazienki',
        locality: 'belchatow',
        completedMonth: '2025-11',
        description:
          'Łazienka 8 m² pod skosem dachu z oknem dachowym. Wanna wbudowana pod skosem, prysznic w najwyższej części pomieszczenia, ogrzewanie podłogowe elektryczne pod płytkami. Wykonaliśmy zabudowę skosów płytą wodoodporną, hydroizolację i płytki 30×60 w jasnym kolorze. Przy odbiorze materiału z hurtowni wyłapaliśmy partię w innym odcieniu i wymieniliśmy ją przed montażem. Czas realizacji: 16 dni roboczych.',
        photoKind: 'bathroom',
        photos: 3,
      },
      {
        title: 'Płytki drewnopodobne w salonie i kuchni, 38 m², Tomaszów',
        service: 'glazurnik',
        locality: 'tomaszow-mazowiecki',
        completedMonth: '2025-08',
        description:
          'Gres drewnopodobny 20×120 w salonie z aneksem kuchennym, układany z przesunięciem o jedną trzecią, żeby uniknąć klawiszowania długich płytek. Przed montażem wyrównaliśmy podłoże wylewką samopoziomującą, a płytki kleiliśmy z systemem poziomowania. Fuga w kolorze drewna, listwy przypodłogowe z tych samych płytek. Prace trwały 5 dni roboczych.',
        photoKind: 'tiles',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Monika, Piotrków',
        body: 'Łazienka marzeń 🛁 Pan Darek najpierw pokazał mi wizualizację każdej ściany, a potem zrobił dokładnie to, co było na rysunku. Dziennik budowy ze zdjęciami to super sprawa ⭐⭐⭐',
        reply: 'Dziękujemy, Pani Moniko! Prosimy pamiętać o impregnacji fug za pół roku 🙂',
        daysAgo: 45,
      },
      {
        rating: 5,
        author: 'Andrzej, Bełchatów',
        body: 'Łazienka na poddaszu ze skosami i oknem dachowym, czyli wszystko, czego nie lubią glazurnicy. Ekipa przyjechała na pomiar, wróciła z rysunkiem rozkładu płytek i wyliczeniem materiału. Przy odbiorze płytek z hurtowni zauważyli, że jedna partia ma inny odcień, i wymienili ją, zanim cokolwiek przykleili. Termin trzeba było rezerwować z dużym wyprzedzeniem, ale warto było czekać.',
        daysAgo: 300,
      },
      {
        rating: 4,
        author: 'Karolina, Tomaszów',
        body: 'Płytki drewnopodobne w salonie położone pięknie, bez uskoków. Długo czekaliśmy na termin, prawie dwa miesiące, ale ekipa przyjechała dokładnie tego dnia, który ustaliliśmy.',
        daysAgo: 395,
      },
      {
        rating: 5,
        author: 'Piotr, Radomsko',
        body: 'Rzetelnie, czysto i bez nerwów 👍 Po skończonej pracy dostałem protokół i teczkę ze zdjęciami hydroizolacji. Pierwszy raz widzę taką dokumentację od firmy remontowej.',
        daysAgo: 12,
      },
    ],
  },
  // 5
  {
    name: 'Iskra Instalacje Elektryczne',
    services: ['elektryk'],
    baseLocality: 'lodz-gorna',
    serviceArea: ['lodz-gorna', 'lodz-polesie', 'lodz', 'pabianice', 'konstantynow-lodzki'],
    shortDescription:
      'Wymiana instalacji elektrycznej w mieszkaniach i domach, nowe rozdzielnice, pomiary z protokołem, oświetlenie LED. Dwóch elektryków z uprawnieniami SEP i krótkie terminy na Górnej i Polesiu.',
    about: [
      'Jesteśmy dwójką elektryków z uprawnieniami SEP do 1 kV: Łukasz i Radek. Poznaliśmy się w 2009 roku na budowie hali magazynowej na Olechowie, a od 2013 roku działamy na własny rachunek. Większość naszych zleceń to mieszkania i domy na Górnej, Polesiu, w Pabianicach i Konstantynowie. Nie mamy dużej ekipy i nie planujemy jej mieć – wolimy osobiście odpowiadać za każde połączenie w puszce i za każdy opis w rozdzielnicy. Radek dodatkowo zna się na domofonach i systemach alarmowych, a Łukasz od kilku lat zajmuje się instalacjami w domach z pompami ciepła, więc dzielimy się zleceniami według tego, kto zna temat lepiej.',
      'Najczęściej wymieniamy kompletne instalacje w blokach z wielkiej płyty, w których wciąż pracują przewody aluminiowe i stare bezpieczniki topikowe. Taka instalacja nie jest przystosowana do płyty indukcyjnej, piekarnika i pralki pracujących jednocześnie. Robimy nowe obwody z przewodów miedzianych, osobne linie do kuchni i łazienki, rozdzielnicę z wyłącznikami różnicowoprądowymi i ochronnikiem przepięć. Przy okazji zawsze proponujemy kilka gniazd więcej, niż klient planował – nikt jeszcze nie narzekał, że ma ich za dużo.',
      'Zanim cokolwiek zaczniemy kuć, rysujemy z klientem plan punktów elektrycznych markerem bezpośrednio na ścianach, w skali 1:1. To najlepszy moment, żeby zastanowić się, gdzie stanie łóżko, telewizor czy biurko. Bruzdy wycinamy bruzdownicą podpiętą do odkurzacza przemysłowego, więc zamiast chmury pyłu jest niewielka ilość kurzu przy samej ścianie. Podłogi i meble, których nie da się wynieść, zabezpieczamy folią. Bruzdy zaprawiamy sami, tak żeby malarz dostał gotową ścianę.',
      'Każdą instalację kończymy pomiarami: rezystancji izolacji, impedancji pętli zwarcia i działania wyłączników różnicowoprądowych. Klient dostaje protokół z pomiarów, schemat rozdzielnicy z opisem obwodów i zdjęcia przebiegu przewodów w ścianach przed zatynkowaniem. Taki komplet przydaje się przy sprzedaży mieszkania, przy ubezpieczeniu i przy każdym kolejnym remoncie, kiedy trzeba wiercić w ścianie.',
      'Robimy też mniejsze rzeczy, które często wypadają przy remontach: oświetlenie LED w sufitach podwieszanych i taśmy w zabudowach kuchennych, podłączenia płyt indukcyjnych, instalacje domofonowe, wymianę rozdzielnic w domach, przygotowanie pod pompę ciepła albo ładowarkę do samochodu. Jeśli klient ma pilną awarię – wybija bezpiecznik i nie wiadomo dlaczego – staramy się przyjechać tego samego lub następnego dnia, dlatego najbliższy wolny termin jest u nas zwykle krótki.',
      'Dużo pracujemy z innymi ekipami – glazurnikami, ekipami od zabudów i firmami robiącymi kompleksowe remonty. Wiemy, jak ważne jest, żeby elektryk nie był wąskim gardłem całej budowy, dlatego zawsze ustalamy z nimi dwa terminy: pierwszy na rozprowadzenie przewodów przed tynkami lub zamknięciem sufitów, drugi na biały montaż po malowaniu. Między tymi wizytami zostawiamy zabezpieczone końcówki przewodów i opis na każdej puszce, żeby nikt nie zatynkował czegoś, co ma zostać na wierzchu. Klientom, którzy myślą o inteligentnym domu, doradzamy, jakie przewody położyć na zapas pod rolety, czujniki czy przyszłe gniazda, bo dołożenie ich po remoncie jest kilka razy droższe niż w trakcie.',
      'Nie podłączamy osprzętu kupionego na zagranicznych aukcjach bez oznaczenia CE, nie robimy instalacji fotowoltaicznych i nie zostawiamy „tymczasowych” połączeń na kostkach. Jeśli podczas prac okazuje się, że trzeba wymienić wewnętrzną linię zasilającą w budynku, pomagamy przygotować dokumenty dla spółdzielni albo zarządcy. Na wykonane prace dajemy 24 miesiące gwarancji, a fakturę VAT wystawiamy zawsze.',
    ],
    yearsExperience: 17,
    teamSize: 2,
    warrantyMonths: 24,
    vatInvoice: true,
    availabilityDays: 2,
    projects: [
      {
        title: 'Nowa instalacja elektryczna w mieszkaniu 56 m² na Chojnach',
        service: 'elektryk',
        locality: 'lodz-gorna',
        completedMonth: '2026-08',
        description:
          'Wymiana instalacji aluminiowej na miedzianą w trzypokojowym mieszkaniu w wielkiej płycie. 14 obwodów, w tym osobne linie do płyty indukcyjnej, piekarnika, pralki i łazienki, nowa rozdzielnica z wyłącznikami różnicowoprądowymi i ochronnikiem przepięć. Punkty rozrysowaliśmy z klientem markerem na ścianach. Prace trwały 6 dni roboczych, a na koniec klient dostał protokół z pomiarów i 60 zdjęć przebiegu przewodów.',
        photoKind: 'electrical',
        photos: 3,
      },
      {
        title: 'Rozdzielnica i obwody pod pompę ciepła, dom w Pabianicach',
        service: 'elektryk',
        locality: 'pabianice',
        completedMonth: '2025-10',
        description:
          'Wymiana starej tablicy z bezpiecznikami topikowymi na rozdzielnicę modułową 48 pól w domu z lat 90. Dołożyliśmy zasilanie trójfazowe pompy ciepła, obwód ładowarki samochodowej w garażu i ochronę przeciwprzepięciową. Wszystkie obwody zostały opisane, a schemat przykleiliśmy na drzwiczkach rozdzielnicy. Prace zajęły 2 dni, przerwa w zasilaniu domu trwała 5 godzin.',
        photoKind: 'electrical',
        photos: 2,
      },
      {
        title: 'Oświetlenie LED w suficie podwieszanym, salon 32 m² na Polesiu',
        service: 'elektryk',
        locality: 'lodz-polesie',
        completedMonth: '2025-03',
        description:
          'Oświetlenie salonu z aneksem w trzech niezależnych strefach: oczka podtynkowe nad kuchnią, taśma LED w ciepłej barwie we wnęce sufitu nad kanapą i lampa nad stołem z możliwością przesunięcia. Zasilacze umieściliśmy w dostępnym miejscu nad szafką, a nie w suficie bez rewizji. Instalację przygotowaliśmy przed zamknięciem sufitu przez ekipę od zabudów. Prace trwały 2 dni.',
        photoKind: 'electrical',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Grzegorz, Chojny',
        body: 'Wymiana całej instalacji w M3 z aluminium na miedź. Panowie najpierw narysowali z nami markerem wszystkie gniazdka na ścianach, potem cięli bruzdy z odkurzaczem – kurzu było naprawdę niewiele 💪 Dostałem protokół z pomiarów i opisaną rozdzielnicę. Polecam 👍',
        daysAgo: 40,
      },
      {
        rating: 5,
        author: 'Natalia, Polesie',
        body: 'Oświetlenie w suficie podwieszanym i taśmy LED w zabudowie. Pan Łukasz doradził, żeby zrobić trzy strefy zamiast jednej, i dziś wiem, że miał rację – wieczorem włączam tylko ciepłe światło nad kanapą. Terminowo, czysto, z fakturą.',
        daysAgo: 390,
      },
      {
        rating: 5,
        author: 'Łucja, Pabianice',
        body: 'W sobotę rano wybijało bezpiecznik co kilka minut. Zadzwoniłam w piątek wieczorem, przyjechali w sobotę przed południem i znaleźli zalaną puszkę w łazience. Uratowali mi weekend 🙏',
        reply:
          'Cieszymy się, że udało się szybko! Puszkę w łazience warto przy najbliższym remoncie przenieść poza strefę prysznica 🙂',
        daysAgo: 95,
      },
      {
        rating: 4,
        author: 'Adam, Konstantynów',
        body: 'Rozdzielnica w domu wymieniona sprawnie, pomiary zrobione, schemat na drzwiczkach. Gwiazdka mniej tylko za to, że trzeba było poczekać kilka dni na jeden wyłącznik, którego zabrakło w hurtowni.',
        daysAgo: 210,
      },
      {
        rating: 5,
        author: 'Zosia, Górna',
        body: 'Dwóch spokojnych, konkretnych panów 😊 Wszystko wytłumaczyli, niczego nie wciskali na siłę, a po pracy zostawili porządek.',
        daysAgo: 8,
      },
    ],
  },
  // 6
  {
    name: 'Rura i Zawór Pabianice',
    services: ['hydraulik', 'remont-lazienki'],
    baseLocality: 'pabianice',
    serviceArea: ['pabianice', 'lodz-gorna', 'zdunska-wola', 'konstantynow-lodzki', 'lodz'],
    shortDescription:
      'Hydraulik z Pabianic: wymiana pionów i podejść, biały montaż, kotły i grzejniki, szybkie usuwanie awarii. Dwóch instalatorów, uczciwe rozliczenie i zdjęcia każdej instalacji przed zakryciem.',
    about: [
      'Firmę Rura i Zawór prowadzi Kamil Sobczak, instalator z Pabianic, który fachu uczył się u ojca, a potem w dużej firmie instalacyjnej przy budowach osiedli na Górnej. Od 2018 roku działa samodzielnie, a od dwóch lat razem z Szymonem, młodszym instalatorem z uprawnieniami gazowymi. Firma obsługuje Pabianice, Konstantynów, Zduńską Wolę i południe Łodzi, a w razie poważnej awarii dojeżdża także do innych dzielnic.',
      'Zakres prac jest typowo hydrauliczny: wymiana instalacji wodnej i kanalizacyjnej w mieszkaniach, podejścia pod nowe łazienki i kuchnie, stelaże podtynkowe, biały montaż, wymiana grzejników i zaworów termostatycznych, montaż i serwis kotłów gazowych. W blokach spółdzielczych firma często wymienia odcinki pionów wspólnie dla kilku mieszkań – wtedy prace są planowane tak, żeby woda była zakręcona jak najkrócej, a mieszkańcy dostają informację na klatce dzień wcześniej.',
      'Kamil stawia na instalacje z rur PP zgrzewanych i wielowarstwowych PEX zaprasowywanych, z mosiężnymi złączkami renomowanych producentów. Nie stosuje tanich złączek skręcanych w ścianach, bo – jak mówi – „to, co schowane w tynku, musi przetrwać dłużej niż płytki”. Każda instalacja przechodzi próbę ciśnieniową z manometrem, a wynik i zdjęcia rozprowadzenia przewodów trafiają do klienta przed zakryciem bruzd.',
      'Przy remontach łazienek firma działa na dwa sposoby. Może przygotować tylko instalacje dla glazurnika wskazanego przez klienta – wtedy Kamil spotyka się z nim na miejscu i razem ustalają wysokości podejść, położenie odpływu i stelaża. Może też zrobić całą łazienkę z zaprzyjaźnionym glazurnikiem z Konstantynowa, z którym tworzy stały duet. W obu przypadkach odbiór instalacji odbywa się z protokołem i pomiarem ciśnienia.',
      'Duża część pracy to awarie: cieknący wężyk pod zlewem, zalany sąsiad z dołu, zapchana kanalizacja, kocioł, który nie chce się uruchomić w pierwszy mróz. Na takie wezwania w samochodzie zawsze jest zapas najczęściej potrzebnych części i spirala do przetykania, więc w większości przypadków problem jest rozwiązany przy pierwszej wizycie. Dlatego najbliższy wolny termin w Rurze i Zaworze często wypada jeszcze tego samego dnia.',
      'Wiele zleceń zaczyna się od pytania, czy instalację trzeba wymieniać w całości. Kamil zawsze najpierw ogląda to, co widać – zawory, podejścia, stan pionu w szachcie – a jeśli trzeba, odkrywa niewielki fragment ściany i sprawdza rury od środka. Nie namawia na wymianę wszystkiego „na wszelki wypadek”, ale przy rurach stalowych ocynkowanych sprzed kilkudziesięciu lat uczciwie mówi, że remont łazienki bez ich wymiany to ryzyko zalania nowych płytek. Klient dostaje zdjęcia tego, co zostało odkryte, i dwie wersje wyceny: minimalną i docelową. W kotłowniach domowych firma sprawdza przy okazji ciśnienie w naczyniu wzbiorczym, stan filtrów i zaworu bezpieczeństwa – to kilka minut, które potrafią oszczędzić zimowej awarii.',
      'Firma nie montuje urządzeń bez instrukcji w języku polskim, nie podłącza gazu bez sprawdzenia szczelności detektorem i nie przerabia pionów bez zgody zarządcy budynku. Przy pracy w mieszkaniu ekipa zakłada ochraniacze na buty i rozkłada folię wokół miejsca pracy, a po wszystkim zabiera ze sobą stare rury i opakowania. Każda zmiana zakresu jest potwierdzana z klientem SMS-em ze zdjęciem i ceną, zanim zostanie wykonana. Na wykonane instalacje firma daje 12 miesięcy gwarancji, a na montowane urządzenia obowiązuje gwarancja producenta.',
    ],
    yearsExperience: 8,
    teamSize: 2,
    warrantyMonths: 12,
    vatInvoice: true,
    availabilityDays: 0,
    projects: [
      {
        title: 'Wymiana instalacji wodnej i kanalizacji w mieszkaniu 42 m², Pabianice',
        service: 'hydraulik',
        locality: 'pabianice',
        completedMonth: '2026-04',
        description:
          'Kompletna wymiana instalacji przed remontem łazienki i kuchni w bloku z lat 80.: nowe rury PP zgrzewane od zaworu przy pionie, kanalizacja PP z wymianą trójnika na pionie, podejścia pod stelaż WC, prysznic bez brodzika, umywalkę, pralkę i zmywarkę. Próba ciśnieniowa przy kliencie, zdjęcia każdej ściany przed zakryciem. Prace trwały 3 dni robocze, woda w pionie była zakręcona łącznie przez 4 godziny.',
        photoKind: 'plumbing',
        photos: 3,
      },
      {
        title: 'Łazienka 3,8 m² z WC podwieszanym, Zduńska Wola',
        service: 'remont-lazienki',
        locality: 'zdunska-wola',
        completedMonth: '2025-12',
        description:
          'Mała łazienka w bloku zrobiona w duecie z glazurnikiem: wanna zamieniona na prysznic 90×90 z odpływem liniowym, WC podwieszane, umywalka 50 cm z szafką i grzejnik drabinkowy w miejscu starego żeberkowego. Płytki 30×60 w jasnej szarości, na podłodze 60×60 z fugą w tym samym kolorze. Całość zajęła 11 dni roboczych, a instalacje odbierała klientka razem z nami z manometrem w ręku.',
        photoKind: 'bathroom',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Jacek, Pabianice',
        body: 'Zalało nas w niedzielę wieczorem – pękł wężyk pod zlewem, woda szła do sąsiada. Pan Kamil był po 40 minutach, zakręcił, wymienił wężyk i jeszcze sprawdził zawory pod umywalką. Wielkie dzięki 🙏',
        reply: 'Dziękujemy! Wężyki warto wymieniać co kilka lat, nawet jeśli wyglądają dobrze 🙂',
        daysAgo: 16,
      },
      {
        rating: 5,
        author: 'Dorota, Konstantynów',
        body: 'Wymiana całej instalacji wodnej i kanalizacji w mieszkaniu przed remontem łazienki. Wszystko na rurach zgrzewanych, próba ciśnienia przy mnie, zdjęcia przed zakryciem. Glazurnik, który przyszedł po nich, powiedział, że dawno nie widział tak porządnie przygotowanych podejść.',
        daysAgo: 170,
      },
      {
        rating: 4,
        author: 'Wiktor, Górna',
        body: 'Szybko i solidnie wymienione dwa grzejniki z zaworami termostatycznymi. Mały minus za ślady na ścianie przy wierceniu, ale sami je zaszpachlowali.',
        daysAgo: 230,
      },
      {
        rating: 5,
        author: 'Anna, Zduńska Wola',
        body: 'Łazienka z WC podwieszanym i prysznicem zrobiona w duecie z glazurnikiem 🛁 Wszystko do siebie pasuje, spadki idealne, nic nie cieknie. Polecam 😊',
        daysAgo: 280,
      },
      {
        rating: 2,
        author: 'Stanisław, Pabianice',
        body: 'Hydraulik zna się na rzeczy, ale końcowa cena za wymianę odcinka pionu była o prawie 30% wyższa niż wstępna wycena przez telefon. Wiem, że w ścianie były skorodowane kolanka, ale wolałbym, żeby ktoś zatrzymał prace i powiedział mi o dopłacie wcześniej, a nie przy płaceniu.',
        reply:
          'Panie Stanisławie, dziękujemy za opinię i przepraszamy. Wycena telefoniczna była orientacyjna, ale ma Pan rację – o dodatkowych kolankach powinniśmy powiedzieć przed ich wymianą, a nie po. Od tego czasu każdą zmianę zakresu potwierdzamy z klientem SMS-em ze zdjęciem i ceną.',
        daysAgo: 340,
      },
      {
        rating: 5,
        author: 'Ela, Bugaj',
        body: 'Wymiana baterii i syfonu w kuchni, zrobione w pół godziny, posprzątane, cena uczciwa 👍',
        daysAgo: 5,
      },
    ],
  },
  // 7
  {
    name: 'Stolarnia Dębowy Sęk',
    services: ['stolarz', 'podlogi'],
    baseLocality: 'zgierz',
    serviceArea: ['zgierz', 'ozorkow', 'lodz-baluty', 'aleksandrow-lodzki', 'lodz'],
    shortDescription:
      'Stolarnia ze Zgierza: meble na wymiar z litego drewna i forniru, schody drewniane, renowacja starych parkietów w kamienicach. Własny warsztat, projekt 3D i montaż w jednych rękach.',
    about: [
      'Warsztat na obrzeżach Zgierza założył w 1995 roku pan Henryk Lis, stolarz meblowy, który wcześniej przez dwadzieścia lat pracował w zgierskich zakładach meblarskich. Dziś prowadzimy go we troje – Henryk, jego córka Magda, która zajmuje się projektami i kontaktem z klientami, oraz Bartek, stolarz po technikum drzewnym. Na budowach pomaga nam dwóch montażystów. Działamy w Zgierzu, Ozorkowie, Aleksandrowie i w północnej części Łodzi.',
      'Robimy meble na wymiar: zabudowy kuchenne, szafy wnękowe, biblioteczki, garderoby, a także schody drewniane na konstrukcji betonowej i stalowej. Pracujemy głównie w litym dębie, jesionie i orzechu oraz w płytach fornirowanych, a lakierowane fronty MDF robimy tylko wtedy, gdy klient naprawdę tego chce. Każdy projekt Magda rysuje w 3D, a po akceptacji przygotowujemy próbkę wybarwienia na kawałku tego samego drewna, z którego powstanie mebel. Klient może zabrać ją do domu i obejrzeć przy swoim świetle.',
      'Drugą częścią naszej pracy są podłogi: renowacja starych parkietów w kamienicach i domach, cyklinowanie bezpyłowe, uzupełnianie brakujących klepek, olejowanie i lakierowanie. Dobrze znamy stare jodełki z lat 30. i 60. – wiemy, jak je wyrównać bez zeszlifowania na wylot i jak dobrać drewno na uzupełnienia, żeby po olejowaniu nie było widać różnicy. Używamy maszyn z odpylaniem i lakierów wodnych o niskiej emisji, a przy olejach – takich, które da się później miejscowo odświeżyć.',
      'Pomiar robimy zawsze sami, nawet jeśli klient ma rysunki od architekta – ściany w starych budynkach rzadko trzymają kąt prosty, a różnica dwóch centymetrów na wysokości szafy potrafi zepsuć cały efekt. Przy montażu zabezpieczamy podłogi tekturą i folią, a wszystkie docinki robimy w warsztacie albo na zewnątrz. W mieszkaniu wiercimy tylko otwory montażowe, z odkurzaczem przy wiertarce.',
      'Klienci często pytają, dlaczego nie podajemy krótkich terminów. Dobre drewno musi się aklimatyzować, a lakier i olej potrzebują czasu. Zabudowa kuchenna to u nas zwykle 6–8 tygodni od akceptacji projektu, schody – około 10 tygodni. W tym czasie wysyłamy zdjęcia z warsztatu, a klient może przyjechać i zobaczyć swój mebel przed montażem. Dlatego zamiast najbliższego wolnego terminu wolimy ustalać datę indywidualnie, po rozmowie i pomiarze.',
      'Henryk lubi powtarzać, że dobry mebel poznaje się po szufladzie. Dlatego w naszych zabudowach stosujemy prowadnice z pełnym wysuwem i cichym domykiem, w meblach z litego dębu – szuflady łączone na jaskółczy ogon, a zawiasy z regulacją w trzech płaszczyznach. Krawędzie frontów fornirowanych oklejamy grubym fornirem, a nie cienką okleiną, żeby po latach dało się je przeszlifować. Do wykończenia używamy olejów twardych na bazie naturalnych olejów roślinnych, które można miejscowo odświeżyć, kiedy na blacie pojawi się zarysowanie. Każdy klient dostaje słoiczek tego samego oleju i instrukcję, jak go używać raz w roku – to wystarczy, żeby dębowy blat wyglądał dobrze przez dekady.',
      'Nie robimy mebli z płyty laminowanej na szybko, nie montujemy gotowych mebli z marketów i nie kładziemy paneli laminowanych. Gdy w trakcie pracy okaże się, że ściana jest krzywa bardziej, niż zakładaliśmy, albo że pod starą podłogą jest zbutwiała konstrukcja legarowa, przerywamy, pokazujemy problem i proponujemy rozwiązanie z wyceną. Na meble i schody dajemy 24 miesiące gwarancji, a przez cały ten czas przyjeżdżamy wyregulować zawiasy i prowadnice bez dodatkowych opłat.',
    ],
    yearsExperience: 31,
    teamSize: 5,
    warrantyMonths: 24,
    vatInvoice: true,
    availabilityDays: null,
    projects: [
      {
        title: 'Szafa wnękowa i biblioteczka z dębu, mieszkanie w Zgierzu',
        service: 'stolarz',
        locality: 'zgierz',
        completedMonth: '2026-01',
        description:
          'Szafa wnękowa 2,6 m wysokości z frontami z forniru dębowego i biblioteczka na całą ścianę salonu z litego dębu olejowanego, z wbudowanym biurkiem i podświetleniem półek. Ściany odbiegały od pionu o 2,5 cm, więc korpusy dopasowaliśmy w warsztacie na podstawie dokładnego pomiaru. Projekt i próbka wybarwienia powstały w 2 tygodnie, produkcja trwała 6 tygodni, montaż – 2 dni.',
        photoKind: 'carpentry',
        photos: 3,
      },
      {
        title: 'Renowacja jodełki dębowej 46 m² w kamienicy na Bałutach',
        service: 'podlogi',
        locality: 'lodz-baluty',
        completedMonth: '2025-09',
        description:
          'Około 90-letnia jodełka dębowa w trzech pokojach, z ubytkami po piecach kaflowych i ścianach wyburzonych przy wcześniejszym remoncie. Uzupełniliśmy 140 klepek drewnem z rozbiórki, wymieniliśmy fragment podłoża pod dawnym piecem, przeszlifowaliśmy całość maszynami z odpylaniem i zabezpieczyliśmy olejem twardym z lekkim pigmentem. Prace trwały 8 dni roboczych, po olejowaniu nowe klepki są nie do odróżnienia.',
        photoKind: 'floor',
        photos: 3,
      },
      {
        title: 'Schody dębowe na konstrukcji betonowej, dom w Ozorkowie',
        service: 'stolarz',
        locality: 'ozorkow',
        completedMonth: '2025-05',
        description:
          'Schody zabiegowe z 15 stopniami z litego dębu klejonego na pełnej lamelce, grubość stopni 4 cm, z podstopnicami lakierowanymi na biało i balustradą z prętów stalowych. Stopnie przykręcane i klejone do betonu klejem elastycznym, dzięki czemu schody nie skrzypią. Od pomiaru do montażu minęło 10 tygodni, sam montaż zajął 3 dni.',
        photoKind: 'carpentry',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Jadwiga, Zgierz',
        body: 'Szafa wnękowa i biblioteczka z dębu w moim mieszkaniu to najpiękniejsze meble, jakie mam. Pani Magda przygotowała projekt w 3D i próbkę olejowanego drewna, którą przez tydzień trzymałam w pokoju, żeby zobaczyć, jak wygląda przy różnym świetle. Pan Henryk osobiście przyjechał na montaż i dopilnował każdego frontu. Czekałam dwa miesiące, ale meble są na lata.',
        reply:
          'Pani Jadwigo, bardzo dziękujemy. Za rok chętnie przyjedziemy sprawdzić zawiasy i odświeżyć olej na blacie biurka.',
        daysAgo: 240,
      },
      {
        rating: 5,
        author: 'Paweł, Bałuty',
        body: 'Uratowali 90-letnią jodełkę, którą dwie firmy kazały wyrzucić 🔥 Uzupełnili brakujące klepki drewnem z rozbiórki i po olejowaniu nie widać, które są nowe. Cyklinowanie praktycznie bez pyłu.',
        daysAgo: 380,
      },
      {
        rating: 4,
        author: 'Marta, Aleksandrów',
        body: 'Piękna robota, kuchnia z jesionu wyszła dokładnie tak, jak na projekcie. Gwiazdka mniej za czas realizacji – 9 tygodni zamiast 7 – ale wiem, że część to schnięcie lakieru.',
        daysAgo: 150,
      },
      {
        rating: 5,
        author: 'Rafał, Ozorków',
        body: 'Schody dębowe na beton – solidne, ciche, nic nie skrzypi 💪 Fachowcy starej daty w najlepszym znaczeniu ⭐',
        daysAgo: 365,
      },
    ],
  },
  // 8
  {
    name: 'Parkiet i Cyklina Kowalczyk',
    services: ['podlogi', 'posadzki'],
    baseLocality: 'lodz-srodmiescie',
    serviceArea: [
      'lodz-srodmiescie',
      'lodz-widzew',
      'lodz-polesie',
      'lodz-gorna',
      'lodz',
      'zgierz',
    ],
    shortDescription:
      'Układanie i cyklinowanie podłóg drewnianych, deski warstwowe, jodełka, winyl SPC i cienkie wylewki pod parkiet. Pomiar wilgotności przed każdym montażem i szlifowanie z odpylaniem.',
    about: [
      'Tomasz Kowalczyk układa podłogi od 2007 roku, a parkieciarstwa uczył się od starszych majstrów, którzy pamiętali jeszcze podłogi w łódzkich kamienicach fabrykanckich. Firma zatrudnia trzy osoby i zajmuje się wyłącznie podłogami – od przygotowania podłoża, przez montaż, po wykończenie olejem lub lakierem. Najwięcej realizacji ma w Śródmieściu i na Widzewie, ale pracuje w całej Łodzi i w Zgierzu. Zlecenia trafiają do niej głównie z poleceń architektów wnętrz i firm wykończeniowych, które same nie chcą ryzykować przy drewnie.',
      'Każde zlecenie zaczyna się od pomiarów, których wiele ekip nie robi wcale: wilgotności wylewki miernikiem karbidowym lub elektronicznym, wilgotności samego drewna i równości podłoża łatą dwumetrową. Wyniki są zapisywane i przekazywane klientowi. Jeśli wylewka jest zbyt mokra, montaż jest przesuwany – nawet jeśli oznacza to zmianę w harmonogramie całego remontu. Kowalczyk powtarza, że parkiet ułożony na mokrej wylewce „pokaże to po pierwszym sezonie grzewczym”, a wtedy nikt już nie pamięta, kto się spieszył.',
      'Firma układa parkiet lity w jodełkę i klepkę, deski warstwowe, mozaikę, a także panele winylowe SPC i LVT klejone lub na zatrzask. Do klejenia drewna stosuje kleje elastyczne bez rozpuszczalników, a pod podłogi pływające – podkłady z barierą przeciwwilgociową. Jeśli podłoże wymaga wyrównania, ekipa wykonuje cienkie wylewki samopoziomujące do 15 mm i szlifuje je przed gruntowaniem. Grubsze wylewki zleca sprawdzonej firmie z Widzewa i odbiera je osobiście z miernikiem w ręku.',
      'Cyklinowanie odbywa się maszynami z workami i odciągiem do odkurzacza przemysłowego, więc pył zostaje w maszynie, a nie na meblach w sąsiednim pokoju. Mimo to ekipa zawsze oddziela remontowane pomieszczenie folią z zamkiem i zabezpiecza drzwi oraz kaloryfery. Do wykończenia firma używa olejów twardych i lakierów wodnych o niskiej emisji, a w kamienicach często poleca olej z delikatnym pigmentem, który wyrównuje kolor uzupełnionych klepek ze starym drewnem.',
      'Klient dostaje harmonogram z podziałem na dni: szlifowanie, szpachlowanie szczelin, kolejne warstwy lakieru lub oleju i czas, kiedy nie wolno wchodzić na podłogę ani stawiać mebli. Po każdej warstwie wysyłane jest zdjęcie, a na koniec – instrukcja pielęgnacji z nazwami środków, które nie zniszczą powłoki. Typowe mieszkanie 60 m² z nową deską warstwową to około 5 dni pracy plus czas schnięcia, a renowacja starej jodełki w trzech pokojach – od 6 do 9 dni.',
      'Tomasz chętnie doradza przy wyborze drewna i nie ukrywa, że nie każde pasuje do każdego domu. Dąb jest najbezpieczniejszy i najłatwiejszy w renowacji, jesion pięknie wygląda, ale mocniej pracuje przy zmianach wilgotności, a egzotyki w mieszkaniach z ogrzewaniem podłogowym poleca tylko w deskach warstwowych. Do domów z psami i małymi dziećmi częściej proponuje olej niż lakier, bo zarysowania da się miejscowo naprawić bez szlifowania całego pokoju. Przy winylu zwraca uwagę na grubość warstwy użytkowej, a nie tylko na wzór.',
      'Firma nie kładzie paneli na stare wykładziny, nie montuje drewna w łazienkach bez sprawnej wentylacji i nie cyklinuje podłóg z widocznymi śladami korników bez wcześniejszego zabezpieczenia drewna. Jeśli po zerwaniu starej wykładziny pojawia się niespodzianka – na przykład pęknięcia wylewki albo stara papa na kleju bitumicznym – prace są wstrzymywane do uzgodnienia rozwiązania i wyceny. Odbiór kończy się protokołem, a gwarancja na wykonane prace wynosi 24 miesiące.',
    ],
    yearsExperience: 19,
    teamSize: 3,
    warrantyMonths: 24,
    vatInvoice: true,
    availabilityDays: 18,
    projects: [
      {
        title: 'Jodełka dębowa 38 m² w kamienicy w Śródmieściu',
        service: 'podlogi',
        locality: 'lodz-srodmiescie',
        completedMonth: '2026-06',
        description:
          'Nowa jodełka francuska z dębu rustykalnego w salonie i sypialni mieszkania w kamienicy. Przed montażem wylewka miała 2,8% wilgotności, więc montaż przesunęliśmy o tydzień, aż spadła poniżej 2%. Klepki klejone klejem elastycznym, szlifowane po 7 dniach i wykończone olejem twardym w odcieniu naturalnym. Prace trwały 6 dni roboczych, a klient dostał kartę pomiarów i instrukcję pielęgnacji.',
        photoKind: 'floor',
        photos: 3,
      },
      {
        title: 'Deska warstwowa i wylewka wyrównująca, 72 m² na Widzewie',
        service: 'podlogi',
        locality: 'lodz-widzew',
        completedMonth: '2025-11',
        description:
          'Mieszkanie w bloku z lat 80. z podłogą odbiegającą od poziomu o 9 mm na długości przedpokoju. Wykonaliśmy cienką wylewkę samopoziomującą w przedpokoju i kuchni, przeszlifowaliśmy całość i położyliśmy deskę warstwową 14 mm klejoną do podłoża, bez listew progowych między pokojami. Listwy przypodłogowe malowane na biało, mocowane na klej. Całość zajęła 6 dni roboczych łącznie ze schnięciem wylewki.',
        photoKind: 'floor',
        photos: 3,
      },
      {
        title: 'Winyl SPC w całym mieszkaniu 54 m², Zgierz',
        service: 'podlogi',
        locality: 'zgierz',
        completedMonth: '2025-03',
        description:
          'Panele winylowe SPC w deskach o długości 150 cm, układane na zatrzask na podkładzie z barierą przeciwwilgociową, również w kuchni i łazience. Przed montażem zerwaliśmy starą wykładzinę PCV i zeszlifowaliśmy resztki kleju. W łazience panele dochodzą do brodzika z dylatacją wypełnioną silikonem. Prace zajęły 3 dni robocze, a klientka mogła wnieść meble już następnego dnia.',
        photoKind: 'floor',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Jakub, Śródmieście',
        body: 'Jodełka w kamienicy wygląda obłędnie 🔥 Przed montażem pan Tomasz zmierzył wilgotność wylewki i powiedział, że trzeba poczekać jeszcze tydzień. Wolałem poczekać niż potem płakać ⭐',
        daysAgo: 70,
      },
      {
        rating: 5,
        author: 'Renata, Widzew',
        body: 'Deska warstwowa w całym mieszkaniu, do tego cienka wylewka wyrównująca w przedpokoju. Wszystko według harmonogramu, po każdym etapie dostawałam zdjęcie. Na koniec instrukcja, czym myć podłogę, z nazwami konkretnych środków. Bardzo profesjonalnie.',
        daysAgo: 300,
      },
      {
        rating: 3,
        author: 'Bartek, Polesie',
        body: 'Podłoga ładna i równa, nie mam zastrzeżeń do wykonania. Trzy gwiazdki, bo montaż przesunął się o 10 dni przez za mokrą wylewkę, a ja miałem już zaplanowaną przeprowadzkę. Rozumiem powody, ale wolałbym wiedzieć wcześniej, że taki pomiar może wszystko przesunąć.',
        reply:
          'Panie Bartku, dziękujemy za opinię. Ma Pan rację, że o możliwym przesunięciu warto mówić już przy wycenie – teraz każdy klient dostaje tę informację na piśmie razem z ofertą. Cieszymy się, że podłoga się podoba 🙂',
        daysAgo: 200,
      },
    ],
  },
  // 9
  {
    name: 'Dach-Mistrz Sieradz',
    services: ['dekarz', 'elewacje'],
    baseLocality: 'sieradz',
    serviceArea: ['sieradz', 'zdunska-wola', 'belchatow'],
    shortDescription:
      'Pokrycia dachowe z dachówki ceramicznej, blachodachówki i blachy na rąbek, obróbki kominów, rynny, okna dachowe i docieplenia elewacji. Ekipa z Sieradza z własnymi rusztowaniami.',
    about: [
      'Dach-Mistrz to firma dekarska z Sieradza, którą prowadzimy od 2001 roku. Zaczynaliśmy od remontów dachów w gospodarstwach pod Sieradzem i Złoczewem, dziś robimy kompletne pokrycia domów jednorodzinnych, budynków gospodarczych i mniejszych obiektów usługowych. W sezonie pracuje u nas siedmiu dekarzy w dwóch brygadach, a jedną z nich prowadzi syn założyciela. Większość zleceń realizujemy w powiecie sieradzkim, zduńskowolskim i bełchatowskim.',
      'Kładziemy dachówkę ceramiczną i betonową, blachodachówkę, blachę na rąbek stojący i gont bitumiczny. Robimy też pełne obróbki blacharskie kominów i ogniomurów, rynny stalowe i tytanowo-cynkowe, montaż okien dachowych z kołnierzami producenta oraz izolację poddaszy wełną. Przy wymianie starego pokrycia z eternitu współpracujemy z wyspecjalizowaną firmą, która ma zezwolenie na usuwanie azbestu – tego nie robimy sami i nie udajemy, że to „tylko kilka płyt”. Dużo rozmawiamy z klientami o wyborze pokrycia, bo to decyzja na kilkadziesiąt lat. Dachówka ceramiczna jest cięższa i droższa, ale cicha w deszczu i bardzo trwała; blachodachówka jest lekka i szybka w montażu, ale wymaga dobrej membrany i starannych obróbek; blacha na rąbek wygląda nowocześnie, lecz nie do każdego domu z lat 80. pasuje. Zawsze sprawdzamy, czy stara więźba udźwignie cięższe pokrycie, a jeśli nie – mówimy o tym wprost.',
      'Zanim podamy cenę, wchodzimy na dach albo oglądamy go z podnośnika i od strony poddasza. Sprawdzamy stan więźby, łat i deskowania, mierzymy połacie i oceniamy kominy. W starszych domach co trzecia więźba ma miejsca zaatakowane przez owady albo zawilgocone przy murłatach – takie rzeczy wpisujemy do oferty osobno, ze zdjęciami i ceną naprawy. Klient wie z góry, za co płaci i co może się zmienić po zdjęciu starego pokrycia.',
      'Na budowie mamy własne rusztowania systemowe z siatkami i daszkami ochronnymi, a każdy dekarz pracuje w szelkach z linką asekuracyjną. Teren wokół domu zabezpieczamy: rabaty i kostkę przykrywamy płytami, a odpady zbieramy na bieżąco do kontenera. Codziennie przed końcem pracy dach jest zabezpieczony membraną lub plandeką – pogoda w naszym regionie potrafi zaskoczyć nawet w lipcu, a nikt nie chce zalanego poddasza w trakcie remontu.',
      'Przy każdej realizacji prowadzimy dokumentację zdjęciową: stan więźby po zdjęciu pokrycia, membrana, kontrłaty, obróbki przy kominach, wykonanie koszy i okapów. Te zdjęcia przekazujemy klientowi razem z protokołem odbioru i kartami gwarancyjnymi materiałów. Na nasze prace dajemy 60 miesięcy gwarancji, a producenci pokryć – zwykle od 15 do 30 lat na materiał. Po pierwszej zimie zapraszamy na bezpłatny przegląd obróbek. Przy okazji wymiany dachu przypominamy też o wyłazie, ławach kominiarskich i płotkach śniegowych, o których łatwo zapomnieć, a które potem trudno dołożyć.',
      'Od kilku lat robimy też docieplenia elewacji metodą lekką mokrą, najczęściej razem z wymianą dachu, bo wtedy można dobrze połączyć izolację ściany z izolacją poddasza i uniknąć mostków termicznych przy murłacie. Pracujemy na styropianie grafitowym i wełnie, z tynkami silikonowymi lub mineralnymi jednego systemu. Klientom, którzy wahają się między materiałami, pokazujemy domy w okolicy zrobione kilka lat temu, żeby mogli zobaczyć, jak się starzeją.',
      'Nie podejmujemy się napraw dużych dachów płaskich z papy ani prac w zimie przy temperaturze poniżej zera, kiedy nie da się dobrze uszczelnić obróbek. Nie montujemy blachy na stare, spróchniałe łaty tylko dlatego, że „tak taniej”. Terminy ustalamy z kilkutygodniowym wyprzedzeniem – w sezonie kalendarz jest pełny – ale awarie po wichurach, takie jak zerwane obróbki czy przecieki przy kominie, staramy się oglądać w ciągu kilku dni.',
    ],
    yearsExperience: 25,
    teamSize: 7,
    warrantyMonths: 60,
    vatInvoice: true,
    availabilityDays: 55,
    projects: [
      {
        title: 'Wymiana pokrycia na dachówkę ceramiczną, dom 160 m² pod Sieradzem',
        service: 'dekarz',
        locality: 'sieradz',
        completedMonth: '2025-07',
        description:
          'Dom z lat 80. z dachem kopertowym pokrytym starą blachą. Po zdjęciu pokrycia wymieniliśmy zawilgocone fragmenty murłat i 14 m bieżących łat, ułożyliśmy membranę wysokoparoprzepuszczalną, kontrłaty i dachówkę ceramiczną angobowaną w kolorze grafitowym. Nowe obróbki dwóch kominów, rynny stalowe i dwa okna dachowe. Prace trwały 3 tygodnie, każdego wieczoru dach był zabezpieczony plandeką.',
        photoKind: 'roof',
        photos: 3,
      },
      {
        title: 'Blacha na rąbek i nowe rynny, dom w Zduńskiej Woli',
        service: 'dekarz',
        locality: 'zdunska-wola',
        completedMonth: '2026-05',
        description:
          'Dach dwuspadowy o powierzchni 210 m² pokryty blachą na rąbek stojący w kolorze antracytowym, układaną na pełnym deskowaniu z matą strukturalną. Ukryte rynny w okapie, rury spustowe prowadzone przy narożnikach, płotki śniegowe nad wejściem. Na kalenicy i przy kominie wykonaliśmy obróbki z tej samej blachy. Prace zajęły 12 dni roboczych z dwoma dniami przerwy na deszcz.',
        photoKind: 'roof',
        photos: 3,
      },
      {
        title: 'Docieplenie elewacji 180 m² styropianem grafitowym, Bełchatów',
        service: 'elewacje',
        locality: 'belchatow',
        completedMonth: '2025-09',
        description:
          'Docieplenie domu jednorodzinnego styropianem grafitowym 15 cm, połączone z wcześniejszą wymianą dachu, dzięki czemu izolacja ściany łączy się z izolacją poddasza bez przerwy przy murłacie. Klejenie metodą obwodowo-punktową, kołkowanie zagłębione z zaślepkami, siatka i tynk silikonowy w kolorze piaskowym. Prace przedłużyły się o dwa tygodnie przez deszczowy wrzesień – nie kładliśmy tynku na mokre podłoże.',
        photoKind: 'facade',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Zbigniew, Sieradz',
        body: 'Wymiana starego pokrycia na dachówkę ceramiczną w domu z lat 80. Przed wyceną dekarze weszli na strych i znaleźli zawilgocone murłaty, o których nie miałem pojęcia. W ofercie było to osobno, ze zdjęciami. Prace trwały trzy tygodnie, każdego wieczoru dach był zakryty, a po zakończeniu posesja wyglądała lepiej niż przed. Dostałem teczkę ze zdjęciami wszystkich etapów i kartami gwarancyjnymi.',
        reply:
          'Dziękujemy, Panie Zbigniewie. Zapraszamy na bezpłatny przegląd obróbek przy kominie po pierwszej zimie.',
        daysAgo: 330,
      },
      {
        rating: 5,
        author: 'Ilona, Zduńska Wola',
        body: 'Blacha na rąbek i nowe rynny – wygląda super nowocześnie 👍 Dekarze w szelkach, rusztowania z siatką, codziennie posprzątane. Na termin czekaliśmy, ale było warto ⭐',
        daysAgo: 110,
      },
      {
        rating: 4,
        author: 'Henryk, Bełchatów',
        body: 'Docieplenie elewacji zrobione porządnie, równy tynk bez smug. Jedyna uwaga – przez deszczowy wrzesień skończyli dwa tygodnie później, niż planowali, ale woleli czekać, niż kłaść tynk na mokro.',
        daysAgo: 380,
      },
      {
        rating: 5,
        author: 'Magda, okolice Sieradza',
        body: 'Naprawa obróbek przy kominie po wichurze. Przyjechali obejrzeć w ciągu kilku dni, a samą naprawę zrobili w jeden dzień. Polecam 😊',
        daysAgo: 25,
      },
    ],
  },
  // 10
  {
    name: 'Elewacje Bursztyn',
    services: ['elewacje', 'tynkarz', 'murarz'],
    baseLocality: 'tomaszow-mazowiecki',
    serviceArea: ['tomaszow-mazowiecki', 'piotrkow-trybunalski', 'brzeziny', 'lodz-widzew', 'lodz'],
    shortDescription:
      'Docieplenia i tynki elewacyjne domów oraz małych budynków, renowacje elewacji ceglanych, tynki maszynowe wewnątrz. Ośmioosobowa ekipa z Tomaszowa z własnymi rusztowaniami.',
    about: [
      'Elewacje Bursztyn to firma z Tomaszowa Mazowieckiego, prowadzona od 2010 roku przez Rafała i Agatę Bursztynowiczów. Zaczynali od tynków maszynowych we wnętrzach nowych domów, a z czasem przeszli na elewacje – dziś to około 70 procent ich pracy. Zespół liczy osiem osób: dwie brygady elewacyjne i dwóch murarzy, którzy zajmują się naprawami ścian, kominów i ogrodzeń. Firma pracuje w Tomaszowie, Piotrkowie, Brzezinach i we wschodniej części Łodzi.',
      'Podstawą jest docieplenie metodą ETICS: styropian grafitowy lub wełna mineralna, klej na całej powierzchni płyty lub metodą obwodowo-punktową, kołkowanie według projektu, warstwa zbrojona z siatką i tynk silikonowy albo mineralny. Firma pracuje na systemach jednego producenta od kleju po tynk, bo tylko wtedy obowiązuje pełna gwarancja systemowa. Przy oknach stosowane są listwy przyokienne z siatką i taśmy rozprężne, a narożniki wzmacniane są profilami z siatką.',
      'Drugą specjalnością są renowacje starych elewacji z cegły – w kamienicach w Tomaszowie i w Łodzi, a także w domach z lat 30. Murarze wymieniają skruszone cegły na rozbiórkowe w podobnym kolorze, fugi wypełniane są zaprawą wapienną, a zabrudzone lico czyszczone jest metodą niskociśnieniową, bez piaskowania, które niszczy wierzchnią warstwę cegły. Na koniec elewacja jest hydrofobizowana preparatem paroprzepuszczalnym, który chroni mur, ale pozwala mu oddychać.',
      'Przed rozpoczęciem prac Agata przygotowuje harmonogram uwzględniający pogodę – tynków cienkowarstwowych nie kładzie się w pełnym słońcu, przy silnym wietrze ani przy temperaturze poniżej 5°C. Ekipa ma na rusztowaniach siatki osłonowe, które chronią świeży tynk przed słońcem i deszczem. Klient otrzymuje co tydzień zdjęcia postępu prac, a przy większych budynkach także krótką notatkę o tym, ile metrów zostało wykonanych i co jest zaplanowane na kolejny tydzień. Agata pomaga też w formalnościach: kompletuje dokumenty do zgłoszenia docieplenia, podpowiada, jakie faktury i zestawienia materiałów są potrzebne do ulgi termomodernizacyjnej, a przy kamienicach w Łodzi uzgadnia z zarządcą zajęcie chodnika i zabezpieczenie przejścia dla pieszych.',
      'Porządek wokół budynku to dla firmy kwestia szacunku dla właścicieli i sąsiadów. Okna i parapety oklejane są folią z taśmą, chodniki i trawniki przykrywane włókniną, a resztki styropianu zbierane codziennie, żeby wiatr nie rozwiewał ich po całej ulicy. Po zdjęciu rusztowań myte są okna i parapety, a teren jest grabiony i porządkowany. Rafał osobiście robi obchód przed demontażem rusztowań, z lampą i listą kontrolną.',
      'Wewnątrz budynków firma nadal wykonuje tynki maszynowe gipsowe i cementowo-wapienne, głównie w nowych domach przed wylewkami. Przed tynkowaniem montowane są narożniki aluminiowe i listwy przy oknach, puszki elektryczne są zabezpieczane, a okna oklejane folią. Ekipa ustala kolejność z elektrykiem i hydraulikiem, żeby nikt nie musiał później kuć świeżego tynku. Przy kolorowych tynkach na elewacji klient zawsze dostaje próbkę na płycie w realnej fakturze, a nie tylko wzornik.',
      'Firma nie wykonuje dociepleń bez projektu lub przynajmniej uzgodnionego doboru grubości izolacji, nie kładzie styropianu na zawilgocone ściany i nie robi elewacji zimą z przyspieszaczami „na siłę”. Jeśli po skuciu starego tynku okaże się, że mur jest spękany albo ma ubytki, murarze naprawiają go przed dociepleniem, a koszt jest uzgadniany z klientem na podstawie zdjęć. Na elewacje firma udziela 60 miesięcy gwarancji.',
    ],
    yearsExperience: 16,
    teamSize: 8,
    warrantyMonths: 60,
    vatInvoice: true,
    availabilityDays: 33,
    projects: [
      {
        title: 'Docieplenie domu 140 m² wełną i tynk silikonowy, Tomaszów',
        service: 'elewacje',
        locality: 'tomaszow-mazowiecki',
        completedMonth: '2025-08',
        description:
          'Docieplenie domu piętrowego wełną mineralną 15 cm na kleju na całej powierzchni, z kołkowaniem stalowym i siatką w dwóch warstwach na parterze. Nowe parapety zewnętrzne z blachy powlekanej, listwy przyokienne i tynk silikonowy o fakturze baranka 1,5 mm w dwóch kolorach. Harmonogram ułożyliśmy tak, żeby nie tynkować w najgorętsze dni sierpnia. Prace trwały 4 tygodnie, po zdjęciu rusztowań umyliśmy wszystkie okna.',
        photoKind: 'facade',
        photos: 3,
      },
      {
        title: 'Renowacja elewacji ceglanej kamienicy, Widzew',
        service: 'murarz',
        locality: 'lodz-widzew',
        completedMonth: '2026-06',
        description:
          'Frontowa elewacja dwupiętrowej kamienicy z czerwonej cegły, około 220 m². Wymieniliśmy 380 skruszonych cegieł na rozbiórkowe dobrane kolorem, wydłubaliśmy stare fugi cementowe i wypełniliśmy spoiny zaprawą wapienną. Lico czyściliśmy metodą niskociśnieniową z gorącą wodą, bez piaskowania. Na koniec hydrofobizacja paroprzepuszczalna. Prace trwały 7 tygodni, rusztowanie było osłonięte siatką od strony chodnika.',
        photoKind: 'brick',
        photos: 3,
      },
      {
        title: 'Tynki maszynowe gipsowe w domu 180 m², Brzeziny',
        service: 'tynkarz',
        locality: 'brzeziny',
        completedMonth: '2025-04',
        description:
          'Tynki gipsowe maszynowe w nowym domu: ściany i sufity na parterze i piętrze, łącznie około 620 m². Przed tynkowaniem zamontowaliśmy narożniki aluminiowe, listwy przyokienne i siatkę na stykach różnych materiałów, a okna i parapety okleiliśmy folią. Puszki elektryczne zostały zabezpieczone, żeby elektryk nie musiał ich wydłubywać. Prace trwały 6 dni roboczych, tynk był gotowy pod malowanie po samym gruntowaniu.',
        photoKind: 'plaster',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Leszek, Tomaszów',
        body: 'Docieplenie domu wełną i tynk silikonowy. Pani Agata ułożyła harmonogram tak, żeby nie tynkować w największe upały, a na rusztowaniach były siatki. Okna oklejone, trawnik przykryty, po zdjęciu rusztowań wszystko umyte. Elewacja równa jak spod linijki.',
        daysAgo: 398,
      },
      {
        rating: 4,
        author: 'Ania, Brzeziny',
        body: 'Tynki maszynowe w całym domu, równe i gładkie 👍 Gwiazdka mniej za kilka zabrudzonych parapetów, które trzeba było doczyścić, ale ekipa zrobiła to sama.',
        daysAgo: 360,
      },
      {
        rating: 5,
        author: 'Sebastian, Piotrków',
        body: 'Renowacja ceglanego ogrodzenia i ściany garażu. Murarze dobrali cegły z rozbiórki prawie w tym samym kolorze, fugi wapienne, wszystko jak dawniej 💪🔥',
        daysAgo: 60,
      },
      {
        rating: 2,
        author: 'Teresa, Tomaszów',
        body: 'Docieplenie zrobione, ale na ścianie od zachodu po kilku tygodniach widać było smugi i miejsca, gdzie tynk ma inny odcień. Firma uznała reklamację, ale poprawki zrobiła dopiero wiosną, bo jesienią było za zimno. Rozumiem technologię, ale przez całą zimę patrzyłam na nierówną elewację.',
        reply:
          'Pani Tereso, dziękujemy za opinię i przepraszamy za kłopot. Przebarwienia powstały przy nagłej zmianie pogody w dniu tynkowania i to był nasz błąd, że nie przerwaliśmy pracy. Termin poprawek wynikał z wymagań producenta tynku. Od tamtego sezonu przy niepewnej prognozie przesuwamy tynkowanie, nawet kosztem kalendarza 🙏',
        daysAgo: 250,
      },
    ],
  },
  // 11
  {
    name: 'Okno na Świat Montaże',
    services: ['okna-i-drzwi'],
    baseLocality: 'lodz',
    serviceArea: [
      'lodz',
      'lodz-baluty',
      'zgierz',
      'aleksandrow-lodzki',
      'pabianice',
      'konstantynow-lodzki',
    ],
    shortDescription:
      'Montaż okien PCV, drewnianych i aluminiowych, drzwi wejściowych i wewnętrznych, parapetów. Ciepły montaż w trzech warstwach i wymiana bez skuwania glifów tam, gdzie się da.',
    about: [
      'Jesteśmy czteroosobową ekipą montażową z Łodzi. Od 2013 roku montujemy okna, drzwi zewnętrzne i wewnętrzne, parapety i bramy garażowe w mieszkaniach i domach w Łodzi i okolicznych miastach. Zaczynaliśmy jako podwykonawcy dużych salonów okiennych, ale z czasem większość klientów zaczęła zgłaszać się do nas bezpośrednio, z poleceń. Dziś pracujemy zarówno z oknami, które dostarczamy sami od dwóch sprawdzonych producentów z województwa, jak i z oknami kupionymi przez klienta.',
      'Okno jest tak dobre, jak jego montaż. Stosujemy ciepły montaż w trzech warstwach: taśma paroszczelna od wewnątrz, pianka niskoprężna w środku i taśma paroprzepuszczalna od zewnątrz. Przy nowych budynkach z dociepleniem polecamy montaż w warstwie izolacji na konsolach – to droższe, ale eliminuje mostek termiczny wokół ramy. Każde okno kotwimy na dyble lub kotwy stalowe, a nie tylko na piankę, i ustawiamy w pionie i poziomie niwelatorem laserowym.',
      'W blokach i kamienicach wymiana okien wiąże się z kurzem i hałasem, dlatego przed wejściem rozkładamy folię ochronną od drzwi wejściowych do okien, meble przy oknach przykrywamy, a do cięcia i skuwania używamy narzędzi podpiętych do odkurzacza przemysłowego. Tam, gdzie się da, wymieniamy okna bez skuwania glifów, a ewentualne ubytki uzupełniamy i szpachlujemy tego samego dnia. Typowe mieszkanie z czterema albo pięcioma oknami to jeden dzień pracy. U starszych klientów pracujemy spokojniej: zaczynamy od pokoju, w którym nikt nie przebywa, pomagamy przenieść kwiaty i firanki, a obsługę klamek i nawiewników pokazujemy tyle razy, ile trzeba.',
      'Przed zamówieniem okien zawsze sami robimy pomiar, nawet gdy klient ma wymiary z projektu. W starych budynkach otwory potrafią różnić się o kilka centymetrów między górą a dołem. Przy pomiarze sprawdzamy też stan nadproży i podokienników – zdarzało się nam znaleźć pod starym parapetem zbutwiałą deskę zamiast muru. Takie rzeczy pokazujemy klientowi na zdjęciach i wyceniamy przed montażem, a nie w dniu wymiany.',
      'Doradzamy przy wyborze, ale bez wciskania najdroższych pakietów. W mieszkaniu przy ruchliwej ulicy ważniejsze od kolejnej szyby jest szkło akustyczne i dobre uszczelki, w domu od strony południowej – szyby z ochroną przeciwsłoneczną, a w pokoju dziecka – klamka z zamkiem i ogranicznik rozwarcia. Przy drzwiach wejściowych zwracamy uwagę na klasę antywłamaniową, próg i to, czy skrzydło nie będzie zahaczać o wycieraczkę. Na pomiarze zawsze mamy ze sobą próbki profili i okuć.',
      'Po montażu regulujemy okucia, sprawdzamy docisk uszczelek, pokazujemy, jak działa mikrouchył i jak dbać o okucia. Spisujemy protokół odbioru z numerami partii okien i zostawiamy zdjęcia wykonanych warstw montażowych. Na sam montaż dajemy 36 miesięcy gwarancji, a po roku, jeśli klient chce, przyjeżdżamy bezpłatnie na regulację – okna w nowych domach często potrzebują jej po pierwszym sezonie grzewczym. Jeśli w mieszkaniu jest piec gazowy z otwartą komorą spalania, zawsze montujemy nawiewniki i tłumaczymy dlaczego – szczelne okna bez dopływu powietrza to realne zagrożenie, a nie formalność.',
      'Nie montujemy okien w otworach bez nadproży, nie robimy montażu „na samą piankę” i nie wymieniamy okien w temperaturze poniżej –5°C, bo pianka i taśmy nie wiążą wtedy prawidłowo. Nie zajmujemy się też oknami dachowymi – takie zlecenia przekazujemy zaprzyjaźnionemu dekarzowi. Jeśli termin dostawy okien od producenta się przesuwa, informujemy klienta od razu i proponujemy nową datę, zamiast przekładać montaż w ostatniej chwili.',
    ],
    yearsExperience: 13,
    teamSize: 4,
    warrantyMonths: 36,
    vatInvoice: true,
    availabilityDays: 21,
    projects: [
      {
        title: 'Wymiana 5 okien PCV bez skuwania glifów, mieszkanie na Bałutach',
        service: 'okna-i-drzwi',
        locality: 'lodz-baluty',
        completedMonth: '2026-03',
        description:
          'Pięć okien PCV z pakietem trzyszybowym, w tym jedno ze szkłem akustycznym od strony ruchliwej ulicy, oraz drzwi balkonowe z niskim progiem. Stare ramy wycięliśmy bez skuwania glifów, nowe okna zakotwiliśmy na dyble i wykonaliśmy ciepły montaż z taśmami. Nowe parapety wewnętrzne z konglomeratu. Cała wymiana trwała jeden dzień, meble i podłogi były zabezpieczone folią przez cały czas pracy.',
        photoKind: 'windows',
        photos: 3,
      },
      {
        title: 'Okna aluminiowe HS 3,5 × 2,4 m i drzwi wejściowe, dom w Aleksandrowie',
        service: 'okna-i-drzwi',
        locality: 'aleksandrow-lodzki',
        completedMonth: '2025-10',
        description:
          'Duże okno przesuwne HS 3,5 × 2,4 m z wyjściem na taras, trzy okna aluminiowe w salonie i stalowe drzwi wejściowe z ciepłym progiem. Pomiar wykazał, że otwór pod HS zwęża się ku górze o 2 cm, więc przed zamówieniem skorygowaliśmy wymiar. Montaż w warstwie izolacji na konsolach, z taśmami paroszczelnymi i paroprzepuszczalnymi. Prace zajęły 2 dni, okno HS wnosiliśmy w sześć osób z podnośnikiem.',
        photoKind: 'windows',
        photos: 3,
      },
      {
        title: 'Drzwi wewnętrzne z ościeżnicą regulowaną, 7 szt., Pabianice',
        service: 'okna-i-drzwi',
        locality: 'pabianice',
        completedMonth: '2025-06',
        description:
          'Siedem skrzydeł bezprzylgowych z ukrytymi zawiasami i ościeżnicami regulowanymi w mieszkaniu po remoncie. Ściany w przedpokoju różniły się grubością o 3 cm, więc dobraliśmy ościeżnice z odpowiednim zakresem regulacji. Drzwi łazienkowe z tuleją wentylacyjną, w sypialniach zamki magnetyczne. Montaż trwał półtora dnia, a jedno porysowane skrzydło zostało wymienione w ramach reklamacji u producenta.',
        photoKind: 'carpentry',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Wojtek, Bałuty',
        body: 'Pięć okien wymienionych w jeden dzień, bez skuwania glifów 😊 Meble przykryte, folia na podłodze, po wszystkim odkurzone. Rano jeszcze stare okna, wieczorem cisza od ulicy ✅',
        reply: 'Dziękujemy! Zapraszamy na bezpłatną regulację okuć za rok 🙂',
        daysAgo: 190,
      },
      {
        rating: 5,
        author: 'Halina, Aleksandrów',
        body: 'Okna aluminiowe z dużym przesuwnym skrzydłem do ogrodu i nowe drzwi wejściowe. Panowie sami zrobili pomiar, chociaż mieliśmy wymiary od architekta – i dobrze, bo otwór był węższy u góry o 2 cm. Montaż ciepły, z taśmami, na koniec protokół i zdjęcia wszystkich warstw.',
        daysAgo: 330,
      },
      {
        rating: 4,
        author: 'Mariusz, Zgierz',
        body: 'Solidny montaż, wszystko wypoziomowane 👍 Termin dostawy okien przesunął się o tydzień, ale dostałem informację od razu, a nie w dniu montażu.',
        daysAgo: 95,
      },
      {
        rating: 5,
        author: 'Sylwia, Konstantynów',
        body: 'Wymiana drzwi wejściowych w bloku. Szybko, czysto, a pan od razu wyregulował zamek i pokazał, jak dbać o uszczelki 🙏',
        daysAgo: 14,
      },
      {
        rating: 3,
        author: 'Kuba, Pabianice',
        body: 'Montaż drzwi wewnętrznych sprawny i ładnie wykończony. Niestety jedno skrzydło przyjechało porysowane i na wymianę czekałem prawie miesiąc. Rozumiem, że to wina producenta, ale przez ten czas miałem w salonie drzwi z widoczną rysą.',
        reply:
          'Panie Kubo, dziękujemy za cierpliwość. Reklamację u producenta zgłosiliśmy tego samego dnia, ale termin wymiany był od nas niezależny. Teraz sprawdzamy każde skrzydło przy odbiorze z hurtowni, zanim przywieziemy je do klienta.',
        daysAgo: 390,
      },
    ],
  },
  // 12
  {
    name: 'Sucha Robota – Zabudowy G-K',
    services: ['sucha-zabudowa', 'malarz', 'tynkarz'],
    baseLocality: 'aleksandrow-lodzki',
    serviceArea: [
      'aleksandrow-lodzki',
      'konstantynow-lodzki',
      'lodz-polesie',
      'lodz-baluty',
      'zgierz',
    ],
    shortDescription:
      'Ścianki działowe, sufity podwieszane, zabudowy poddaszy, wnęki pod oświetlenie i gładzie. Trzyosobowa ekipa z Aleksandrowa, która pracuje czysto, mierzy laserem i pamięta o wzmocnieniach.',
    about: [
      'Sucha Robota to trzyosobowa ekipa z Aleksandrowa Łódzkiego, którą w 2019 roku założyli Marcin i Daniel – wcześniej przez kilka lat pracowali przy wykończeniach biurowców w centrum Łodzi. Z pracy przy dużych inwestycjach wynieśli dyscyplinę: dokładne pomiary, równe płaszczyzny i porządek na stanowisku. Trzecim członkiem zespołu jest Oskar, który zaczynał jako pomocnik, a dziś samodzielnie prowadzi szpachlowanie i malowanie. Firma skupia się na zabudowach z płyt gipsowo-kartonowych w mieszkaniach i domach, uzupełniając je gładziami i malowaniem.',
      'Najczęstsze zlecenia to ścianki działowe przy zmianie układu mieszkania, sufity podwieszane z oświetleniem LED, zabudowy poddaszy z izolacją, obudowy pionów i stelaży oraz wnęki i półki z płyt. Na poddaszach firma wykonuje pełen układ: wełna mineralna, folia paroizolacyjna z klejonymi zakładami, ruszt i płyty. Ekipa pracuje na systemach Knauf i Siniat, z profilami ocynkowanymi o grubości zgodnej z wymaganiami producenta – bez cieńszych zamienników, które potem pracują i pękają na łączeniach.',
      'Wszystko zaczyna się od pomiaru i wyznaczenia linii laserem krzyżowym. Przed montażem klient dostaje szkic z zaznaczonymi ścianami, drzwiami i miejscami na wzmocnienia pod szafki, telewizor czy umywalkę. Właśnie wzmocnienia to rzecz, o której wiele osób zapomina, dlatego ekipa zawsze o nie pyta i zaznacza ich położenie na zdjęciach przed zamknięciem ścian. W ściankach między sypialniami standardem jest wełna akustyczna i podwójne opłytowanie.',
      'Łączenia płyt zbrojone są taśmą z włókna szklanego lub papierową, a narożniki – profilami narożnymi. Szpachlowanie odbywa się w dwóch–trzech warstwach, a szlifowanie – szlifierką typu żyrafa z odkurzaczem przemysłowym. Płyty docinane są w miarę możliwości na balkonie lub w wydzielonym miejscu, a podłogi chronione są matą ochronną. Po każdym dniu pracy w mieszkaniu zostaje porządek, a narzędzia są składane w jednym kącie.',
      'Ekipa wysyła zdjęcia postępu prac na koniec każdego dnia i krótko opisuje, co będzie robione następnego. Klient zawsze wie, kiedy przyjdzie elektryk, żeby przeciągnąć przewody przed zamknięciem sufitu, bo firma sama koordynuje ten moment. Typowa zabudowa poddasza 50 m² zajmuje około dwóch tygodni, a sufit podwieszany w salonie – dwa, trzy dni plus szpachlowanie i malowanie. Przy większych zleceniach Daniel rozpisuje harmonogram w prostej tabeli i zaznacza w nim dni, w których hałas będzie największy, żeby klient mógł uprzedzić sąsiadów albo zaplanować pracę zdalną poza domem. W blokach na klatce wisi kartka z godzinami cięcia i wkręcania.',
      'Marcin lubi rozwiązania, które ułatwiają życie po remoncie: rewizje w obudowach stelaży i pionów, wnęki na zasłony z ukrytą szyną, półki z płyt we wnękach łazienkowych zabezpieczone hydroizolacją, schowki pod skosami z drzwiczkami na magnes. Przy sufitach z taśmą LED zawsze pyta, gdzie będzie zasilacz, i zostawia do niego dostęp. Dzięki temu po kilku latach nie trzeba wycinać płyty, żeby wymienić jeden element.',
      'Firma nie stawia ścianek działowych z płyt w miejscach, gdzie mają wisieć ciężkie szafki bez dodatkowego wzmocnienia, i nie montuje płyt na zawilgoconych ścianach. Nie robi też elewacji ani tynków maszynowych na dużą skalę. Jeśli po zdjęciu starej podsufitki pojawi się na przykład zbutwiała deska albo przeciek z dachu, prace są wstrzymywane, a klient dostaje zdjęcia i rekomendację fachowca. Prace kończą się protokołem odbioru i 24-miesięczną gwarancją.',
    ],
    yearsExperience: 7,
    teamSize: 3,
    warrantyMonths: 24,
    vatInvoice: true,
    availabilityDays: 9,
    projects: [
      {
        title: 'Zabudowa poddasza 54 m² z izolacją, dom w Aleksandrowie',
        service: 'sucha-zabudowa',
        locality: 'aleksandrow-lodzki',
        completedMonth: '2026-02',
        description:
          'Adaptacja nieużytkowego poddasza na dwa pokoje i garderobę: wełna mineralna 25 cm w dwóch warstwach, folia paroizolacyjna z klejonymi zakładami, ruszt na wieszakach i płyty gipsowe w dwóch warstwach na skosach. Ścianka między pokojami z wełną akustyczną, schowki pod skosami z drzwiczkami. Wzmocnienia pod biurko i telewizor zaznaczone na zdjęciach. Prace trwały 11 dni roboczych, szpachlowanie i malowanie – kolejne 5.',
        photoKind: 'drywall',
        photos: 3,
      },
      {
        title: 'Sufit podwieszany z wnęką LED, salon 28 m² na Polesiu',
        service: 'sucha-zabudowa',
        locality: 'lodz-polesie',
        completedMonth: '2025-12',
        description:
          'Sufit podwieszany obniżony o 12 cm z obwodową wnęką na taśmę LED i ukrytą szyną na zasłony przy oknie. Przed zamknięciem sufitu elektryk przeciągnął przewody pod oczka nad aneksem kuchennym, a zasilacz taśmy znalazł miejsce w dostępnej rewizji nad szafką. Łączenia zbrojone taśmą, szlifowanie bezpyłowe, malowanie na biało matową farbą. Całość zajęła 4 dni robocze.',
        photoKind: 'drywall',
        photos: 2,
      },
      {
        title: 'Nowa ścianka działowa i gładzie, 3 pokoje zamiast 2, Konstantynów',
        service: 'sucha-zabudowa',
        locality: 'konstantynow-lodzki',
        completedMonth: '2025-04',
        description:
          'Podział dużego pokoju w bloku na dwa mniejsze dla rodzeństwa: ścianka z profili 75 mm z wełną akustyczną i podwójnym opłytowaniem, drzwi z ościeżnicą regulowaną i wzmocnienia pod półki. Do tego gładzie i malowanie w trzech pokojach. Ściankę ustawiliśmy tak, żeby każdy pokój miał połowę okna – wymagało to przesunięcia jej o 8 cm względem pierwotnego planu. Prace trwały 7 dni roboczych.',
        photoKind: 'drywall',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Daria, Aleksandrów',
        body: 'Poddasze z płyt, ocieplone i z idealnie równymi skosami 🔥 Codziennie zdjęcie na koniec dnia i informacja, co jutro. Pamiętali o wzmocnieniach pod telewizor i półki, o których ja sama bym zapomniała 😊',
        reply:
          'Dziękujemy, Pani Dario! Miejsca wzmocnień są na zdjęciach, które Pani przesłaliśmy – warto je zachować 🙂',
        daysAgo: 220,
      },
      {
        rating: 5,
        author: 'Kamil, Polesie',
        body: 'Sufit podwieszany w salonie z wnęką na taśmę LED. Linie proste, łączenia niewidoczne nawet przy bocznym świetle. Sami umówili elektryka na dzień przed zamknięciem sufitu, więc nie musiałem niczego koordynować.',
        daysAgo: 280,
      },
      {
        rating: 4,
        author: 'Ania, Konstantynów',
        body: 'Nowa ścianka działowa i gładzie w trzech pokojach. Wszystko równo i czysto ✅ Gwiazdka mniej, bo szlifowanie jednak trochę pyliło w przedpokoju, ale wszystko posprzątali.',
        daysAgo: 375,
      },
    ],
  },
  // 13
  {
    name: 'Fachowa Ręka Kutno',
    services: ['remont-mieszkania', 'malarz', 'glazurnik'],
    baseLocality: 'kutno',
    serviceArea: ['kutno', 'lowicz'],
    shortDescription:
      'Dwóch fachowców z Kutna: remonty mieszkań w blokach, malowanie, płytki w kuchniach i łazienkach. Bierzemy też małe zlecenia, wyceniamy rzetelnie i sprzątamy po każdym dniu pracy.',
    about: [
      'Jesteśmy dwójką fachowców z Kutna – Sławek i Grzesiek. Znamy się od podstawówki, a od 2020 roku robimy remonty razem. Wcześniej Sławek przez kilka lat pracował w Holandii przy wykończeniach mieszkań, a Grzesiek prowadził małą firmę malarską i jeździł z ekipą po całym powiecie. Działamy w Kutnie i okolicy, a raz na jakiś czas jeździmy do Łowicza, skąd mamy kilku stałych klientów, którzy polecają nas dalej.',
      'Robimy przede wszystkim remonty mieszkań w blokach: zrywanie starych tapet, gładzie, malowanie, panele, drzwi wewnętrzne, płytki w kuchni i łazience. Bierzemy też mniejsze zlecenia, których duże firmy nie chcą: odświeżenie jednego pokoju, położenie płytek nad blatem, wymiana listew czy naprawa pękniętej fugi. Uważamy, że małe zlecenie zrobione dobrze to najlepsza reklama – wiele naszych dużych remontów zaczęło się właśnie od jednego pokoju. Często wracamy do tych samych klientów co roku – raz do kuchni, raz do łazienki, raz do przedpokoju – i to jest dla nas najlepsza ocena naszej pracy.',
      'Wycena jest u nas bezpłatna i zawsze robimy ją na miejscu, a nie przez telefon. Rozpisujemy ją na pozycje, żeby było widać, ile kosztuje robocizna, a ile materiał. Materiał możemy kupić sami w kutnowskich hurtowniach, ale nie musimy – jeśli klient woli wybrać płytki czy farbę samodzielnie, doradzamy, ile kupić i czego unikać. Do materiałów kupionych przez nas nie doliczamy marży, rozliczamy się na podstawie paragonu.',
      'W mieszkaniach, w których ktoś mieszka w trakcie remontu, pracujemy pokój po pokoju. Meble przesuwamy i owijamy folią, podłogi zabezpieczamy tekturą, a ściany szlifujemy szlifierką z odkurzaczem przemysłowym. Po każdym dniu sprzątamy, wynosimy śmieci i zostawiamy wolne przejście do kuchni i łazienki. Klient zawsze wie, w którym pokoju będziemy jutro, a jeśli chce, wysyłamy zdjęcia z każdego dnia na Messengerze albo SMS-em. Starszym klientom pomagamy przenieść cięższe meble i powiesić z powrotem firanki, karnisze i obrazy – bez dopłat.',
      'Przy płytkach Sławek pilnuje rzeczy, które w Holandii były standardem: równe płaszczyzny przed klejeniem, fuga dobrana do pomieszczenia, silikon sanitarny w narożnikach zamiast fugi. W łazienkach zawsze robimy hydroizolację pod prysznicem i przy wannie, nawet jeśli klient pyta, czy to konieczne. Grzesiek odpowiada za ściany i kolory – potrafi doradzić, jak rozjaśnić ciemny przedpokój w bloku albo jaki odcień bieli wybrać do pokoju od północy.',
      'Jesteśmy małą firmą zwolnioną z VAT, więc nie wystawiamy faktur VAT – dajemy rachunek i pisemną umowę z zakresem prac i ceną. Na nasze prace udzielamy 12 miesięcy gwarancji, a jeśli coś trzeba poprawić, przyjeżdżamy w ciągu tygodnia. Na koniec przechodzimy z klientem po mieszkaniu i spisujemy krótki protokół odbioru – czasem na kartce, ale zawsze z podpisami obu stron.',
      'Nie robimy instalacji elektrycznych ani gazowych, bo nie mamy uprawnień – w takich przypadkach polecamy znajomego elektryka z Kutna. Nie podejmujemy się też prac na wysokości, dachów i elewacji. Kiedy w trakcie remontu wychodzi coś nieprzewidzianego, na przykład odpadający tynk pod tapetą, od razu pokazujemy to klientowi i mówimy, ile kosztuje naprawa. Terminy ustalamy telefonicznie, bo często zmieniają się z tygodnia na tydzień – dlatego nie podajemy tu najbliższego wolnego dnia.',
    ],
    yearsExperience: 6,
    teamSize: 2,
    warrantyMonths: 12,
    vatInvoice: false,
    availabilityDays: null,
    projects: [
      {
        title: 'Remont mieszkania 38 m² w bloku na Łąkoszynie',
        service: 'remont-mieszkania',
        locality: 'kutno',
        completedMonth: '2026-04',
        description:
          'Dwupokojowe mieszkanie po babci klientki: zerwanie tapet i boazerii, naprawa odpadającego tynku w przedpokoju, gładzie i malowanie, panele w pokojach, płytki w kuchni nad blatem i nowe drzwi wewnętrzne z ościeżnicami regulowanymi. Pracowaliśmy pokój po pokoju, bo klientka mieszkała w trakcie remontu. Całość zajęła 4 tygodnie, a materiały rozliczyliśmy na podstawie paragonów z hurtowni.',
        photoKind: 'renovation',
        photos: 3,
      },
      {
        title: 'Płytki w kuchni i łazience, 14 m², Łowicz',
        service: 'glazurnik',
        locality: 'lowicz',
        completedMonth: '2025-08',
        description:
          'Płytki 30×60 na ścianach łazienki i 60×60 na podłodze, z hydroizolacją w strefie prysznica, oraz płytki 10×10 w kolorze butelkowej zieleni nad blatem kuchennym. Ściany w łazience wyrównaliśmy przed klejeniem, a narożniki wykończyliśmy silikonem sanitarnym zamiast fugi. Pomogliśmy klientom wyliczyć materiał, więc zostało dosłownie kilka płytek. Prace trwały 7 dni roboczych.',
        photoKind: 'tiles',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Krystyna, Kutno',
        body: 'Szukałam kogoś do pomalowania jednego pokoju i wszyscy odmawiali, bo za małe zlecenie. Panowie przyszli, zerwali starą tapetę, wyrównali ścianę i pomalowali w dwa dni. Teraz robią mi kuchnię 🙏',
        reply: 'Dziękujemy, Pani Krystyno! Do zobaczenia w kuchni 🙂',
        daysAgo: 30,
      },
      {
        rating: 5,
        author: 'Damian, Łowicz',
        body: 'Płytki w kuchni i łazience, wszystko równo, fugi czyste 👍 Doradzili, ile płytek kupić, i zostało nam dosłownie kilka sztuk. Konkretne chłopaki 💪',
        daysAgo: 380,
      },
      {
        rating: 4,
        author: 'Paulina, Kutno',
        body: 'Remont mieszkania po babci – gładzie, malowanie, panele, drzwi. Dobra robota i uczciwe rozliczenie materiałów po paragonach. Jedyny minus to brak faktury VAT, ale było to jasno powiedziane na początku.',
        daysAgo: 160,
      },
      {
        rating: 5,
        author: 'Edward, Łąkoszyn',
        body: 'Mieszkałem w trakcie remontu, a panowie pracowali pokój po pokoju i codziennie sprzątali. Na koniec spisaliśmy protokół. Polecam.',
        daysAgo: 145,
      },
    ],
  },
  // 14
  {
    name: 'Glazura Mazur',
    services: ['glazurnik', 'remont-lazienki'],
    baseLocality: 'konstantynow-lodzki',
    serviceArea: [
      'konstantynow-lodzki',
      'aleksandrow-lodzki',
      'lodz-polesie',
      'lodz-baluty',
      'pabianice',
    ],
    shortDescription:
      'Glazurnik z Konstantynowa: płytki wielkoformatowe, spieki kwarcowe, mozaiki, lastryko, schody z płytek i tarasy. Pracuje sam, więc każdą płytkę i każdą fugę kładzie osobiście.',
    about: [
      'Glazura Mazur to jednoosobowa firma Wojciecha Mazura z Konstantynowa Łódzkiego. Wojtek kładzie płytki od 2014 roku, a wcześniej przez dwa lata był pomocnikiem w ekipie łazienkowej na Retkini, gdzie – jak sam mówi – nauczył się przede wszystkim tego, czego nie robić. Pracuje sam i świadomie nie powiększa firmy. Klienci, którzy go polecają, najczęściej podkreślają właśnie to, że od pierwszego pomiaru do ostatniej fugi rozmawiają z tą samą osobą.',
      'Specjalnością Wojtka są płytki wielkoformatowe i spieki kwarcowe: 120×120, 160×80, a nawet 280×120 na ścianach w łazienkach i kuchniach. Do takich formatów ma specjalistyczny sprzęt – stół do cięcia długich płytek, przyssawki, ramę transportową, system poziomowania i kleje o pełnym podparciu. Kładzie również mozaiki, płytki heksagonalne, lastryko, płytki ręcznie robione i cegłę dekoracyjną na ścianach wewnętrznych. Robi też schody z płytek i tarasy na zewnątrz z hydroizolacją i drenażem.',
      'Przygotowanie to dla niego połowa pracy. Przed kładzeniem sprawdza płaszczyzny łatą i laserem, a jeśli ściany są krzywe, wyrównuje je tynkiem lub płytą – nie „nadrabia” grubą warstwą kleju. Rozkład płytek planuje z klientem na kartce lub w prostym programie, tak żeby docinki wypadały symetrycznie i w mniej widocznych miejscach. Przy łazienkach dba o to, żeby fuga na ścianie przechodziła płynnie w fugę na podłodze, a wnęki i półki wypadały na pełnych płytkach. Przy dużych formatach proponuje czasem rezygnację z listew przypodłogowych na rzecz cokołu z tej samej płytki albo cienkiego profilu aluminiowego, bo przy spiekach każdy dodatkowy element psuje wrażenie jednolitej powierzchni.',
      'Ponieważ Wojtek pracuje w zamieszkanych mieszkaniach, płytki tnie na mokro na balkonie albo w wydzielonej strefie, a szlifowanie krawędzi robi szlifierką z odkurzaczem przemysłowym. Podłogi w przedpokoju i na klatce zabezpiecza folią i tekturą, a wielkie formaty wnosi tak, żeby nie obić ścian na klatce. Codziennie wieczorem wysyła klientowi zdjęcie z postępu prac i krótko pisze, co będzie robione następnego dnia.',
      'Hydraulikę i demontaż przy remontach łazienek zleca zaprzyjaźnionemu instalatorowi z Pabianic, z którym pracuje od lat, a sam przejmuje łazienkę od etapu wylewki i hydroizolacji. Hydroizolację robi zawsze osobiście, bo – jak mówi – „za to, co pod płytką, i tak odpowiada glazurnik”. Stosuje fugi epoksydowe w strefach mokrych i cementowe z dodatkiem hydrofobowym w pozostałych miejscach, a narożniki wykańcza silikonem sanitarnym w kolorze fugi.',
      'Zanim cokolwiek przyklei, Wojtek otwiera kilka kartonów i porównuje płytki przy dziennym świetle. Zdarzało się, że jedna partia miała inny odcień albo kaliber, co dało się wyłapać tylko przy takim porównaniu. Przy spiekach sprawdza też, czy płyty nie mają mikropęknięć po transporcie. Jeśli coś jest nie tak, wstrzymuje pracę i pomaga klientowi w reklamacji, zamiast kłaść wadliwy materiał i liczyć, że nikt nie zauważy.',
      'Nie kładzie płytek na stare płytki, nie fuguje na drugi dzień po przyklejeniu, jeśli klej tego nie przewiduje, i nie podejmuje się tarasów bez możliwości wykonania spadku. Wojtek nie jest płatnikiem VAT i wystawia rachunek. Na prace daje 24 miesiące gwarancji, a odbiór kończy protokołem z listą użytych materiałów – nazwami klejów, fug i hydroizolacji – żeby za kilka lat łatwo było dokupić to samo.',
    ],
    yearsExperience: 12,
    teamSize: 1,
    warrantyMonths: 24,
    vatInvoice: false,
    availabilityDays: 7,
    projects: [
      {
        title: 'Spiek 280×120 na ścianie w łazience, Konstantynów',
        service: 'glazurnik',
        locality: 'konstantynow-lodzki',
        completedMonth: '2026-09',
        description:
          'Dwie płyty spieku kwarcowego 280×120 imitującego marmur na ścianie za wanną, z dopasowanym rysunkiem żyłek między płytami, oraz płytki 120×120 na podłodze. Płyty wnieśliśmy na ramie transportowej przez klatkę bloku, cięcia pod baterię podtynkową wykonaliśmy na miejscu. Fuga na ścianie przechodzi w fugę na podłodze bez przesunięcia. Prace glazurnicze trwały 8 dni roboczych.',
        photoKind: 'tiles',
        photos: 3,
      },
      {
        title: 'Łazienka z mozaiką i lastryko, 7 m², Polesie',
        service: 'remont-lazienki',
        locality: 'lodz-polesie',
        completedMonth: '2025-11',
        description:
          'Łazienka w kamienicy z wysokim sufitem: lastryko 60×60 na podłodze, mozaika szklana na ścianie prysznica i płytki 7,5×30 w jodełkę do wysokości 140 cm na pozostałych ścianach. Rozkład przesunęliśmy o 3 cm, żeby docinki wypadły przy drzwiach, a nie przy wannie. Hydroizolacja w dwóch warstwach z taśmami, fuga epoksydowa w prysznicu. Instalacje przygotował instalator z Pabianic, płytki zajęły 12 dni roboczych.',
        photoKind: 'bathroom',
        photos: 3,
      },
      {
        title: 'Taras 24 m² z gresu mrozoodpornego, Aleksandrów',
        service: 'glazurnik',
        locality: 'aleksandrow-lodzki',
        completedMonth: '2025-06',
        description:
          'Taras przy domu jednorodzinnym na płycie betonowej: wylewka spadkowa 1,5%, hydroizolacja z masy dwuskładnikowej z taśmami przy ścianie, mata drenażowa i gres mrozoodporny 60×60 o grubości 2 cm klejony klejem elastycznym. Na krawędzi profil okapowy z rynienką. Prace trwały 6 dni roboczych, w tym 3 dni na schnięcie warstw.',
        photoKind: 'tiles',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Ewelina, Konstantynów',
        body: 'Spiek 280×120 na ścianie w łazience – myślałam, że to niemożliwe w bloku, a pan Wojtek wniósł płyty na ramie przez klatkę i położył bez jednej szczerby 🔥 Fuga na ścianie przechodzi w fugę na podłodze ⭐',
        reply: 'Dziękuję, Pani Ewelino! Spieki w bloku to zawsze przygoda, ale warto 🙂',
        daysAgo: 18,
      },
      {
        rating: 5,
        author: 'Przemek, Polesie',
        body: 'Łazienka z mozaiką na ścianie prysznica i lastryko na podłodze. Pan Wojtek przed rozpoczęciem rozrysował z nami cały rozkład i przesunął go o 3 cm, żeby docinki wypadły przy drzwiach, a nie przy wannie. Hydroizolację robił sam i pokazywał zdjęcia przed płytkami. Fachowiec, który myśli.',
        daysAgo: 300,
      },
      {
        rating: 5,
        author: 'Gosia, Bałuty',
        body: 'Polecam z całego serca 🛁😊 Pracował sam, codziennie wysyłał zdjęcia, a na koniec dostałam listę wszystkich materiałów z nazwami fug i klejów.',
        daysAgo: 85,
      },
      {
        rating: 4,
        author: 'Leon, Aleksandrów',
        body: 'Taras z płytek zrobiony bardzo dobrze, ze spadkiem i drenażem. Trochę długo czekaliśmy na termin, bo pan Wojtek pracuje sam, ale jakość to rekompensuje.',
        daysAgo: 395,
      },
      {
        rating: 5,
        author: 'Iza, Pabianice',
        body: 'Płytki w kuchni nad blatem i w przedpokoju. Szybko, czysto, perfekcyjnie 👍',
        daysAgo: 52,
      },
    ],
  },
  // 15
  {
    name: 'Ampera Elektryka',
    services: ['elektryk'],
    baseLocality: 'skierniewice',
    serviceArea: ['skierniewice', 'lowicz', 'brzeziny'],
    shortDescription:
      'Instalacje elektryczne w nowych domach i modernizacje starszych budynków, rozdzielnice, oświetlenie zewnętrzne, odgromówki i przeglądy z pomiarami. Trzech elektryków ze Skierniewic.',
    about: [
      'Ampera Elektryka to rodzinna firma ze Skierniewic. Prowadzimy ją od 2006 roku – najpierw jako jednoosobową działalność Janusza, dziś we trzech: Janusz, jego syn Igor i Wiktor, który przyszedł do nas na praktyki z technikum elektrycznego i po prostu został. Pracujemy w Skierniewicach, Łowiczu, Brzezinach i okolicznych gminach, głównie w nowych domach jednorodzinnych i przy modernizacjach starszych budynków, ale także w małych sklepach, warsztatach i gospodarstwach. Pod Łowiczem często zaczynamy od rozdzielnicy w budynku gospodarczym, w której przez lata dokładano kolejne zabezpieczenia, a kończymy na modernizacji całego domu.',
      'W nowych domach robimy instalację od projektu do odbioru: rozmieszczenie punktów, okablowanie, rozdzielnicę główną i podrozdzielnice, uziemienie, instalację odgromową, okablowanie strukturalne pod internet i telewizję, przygotowanie pod rolety elektryczne, bramę, monitoring i ładowarkę samochodową. Projekt rozpisujemy z klientem na rzucie domu, pokój po pokoju, i liczymy, ile gniazd potrzeba w miejscu, gdzie stanie biurko, łóżko czy telewizor. Lepiej poświęcić na to jeden wieczór niż przez dwadzieścia lat żyć z przedłużaczami. Przy domach, w których za kilka lat może pojawić się pompa ciepła albo fotowoltaika, od razu planujemy miejsce w rozdzielnicy i trasę przewodów, żeby potem nie kuć świeżo pomalowanych ścian.',
      'Przy modernizacjach starszych domów najczęściej spotykamy instalacje dwużyłowe bez przewodu ochronnego, stare tablice z bezpiecznikami i dokładane przez lata „przedłużki w ścianie”. Zanim cokolwiek zaczniemy, robimy przegląd z pomiarami i spisujemy, co nadaje się do zostawienia, a co trzeba wymienić. Często da się rozłożyć modernizację na etapy – na przykład najpierw nowa rozdzielnica z wyłącznikami różnicowoprądowymi, a potem kolejne pomieszczenia przy okazji remontów. Dzięki temu domownicy nie muszą się wyprowadzać, a koszty rozkładają się w czasie.',
      'Na budowie pracujemy tak, żeby zostawić po sobie jak najmniej kurzu: bruzdownica z odkurzaczem przemysłowym, folie na meblach i podłogach, zaprawianie bruzd tego samego dnia. W nowych domach zostawiamy oznaczone i zaizolowane końcówki przewodów, a każda puszka ma opis na rysunku. Przed tynkowaniem robimy zdjęcia wszystkich ścian z przewodami i przekazujemy je klientowi razem ze schematem, żeby za kilka lat nikt nie przewiercił kabla przy wieszaniu szafki.',
      'Każdą instalację kończymy pomiarami i protokołem: rezystancja izolacji, ciągłość przewodów ochronnych, impedancja pętli zwarcia, rezystancja uziemienia, test wyłączników różnicowoprądowych. Wykonujemy też okresowe przeglądy instalacji w domach i lokalach usługowych, których wymagają ubezpieczyciele i zarządcy budynków. Protokół dostarczamy zwykle jeszcze tego samego dnia, a jeśli coś wymaga naprawy, opisujemy to prostym językiem, bez straszenia i bez wciskania niepotrzebnych prac.',
      'Na nowych budowach elektryk musi zgrać się z murarzami, tynkarzami i wylewkarzami, dlatego harmonogram ustalamy z kierownikiem budowy albo bezpośrednio z innymi ekipami. Przychodzimy dwa razy: na rozprowadzenie przewodów przed tynkami i na biały montaż po malowaniu, a między tymi etapami jesteśmy pod telefonem, gdyby trzeba było coś przesunąć. Igor prowadzi dla każdej budowy prosty arkusz z listą obwodów i zmian wprowadzonych w trakcie, który klient dostaje na koniec razem z dokumentacją.',
      'Nie robimy instalacji fotowoltaicznych – przy takich zleceniach współpracujemy z wyspecjalizowaną firmą i przygotowujemy tylko rozdzielnicę i trasę kabli. Nie podłączamy kuchenek gazowych i nie pracujemy pod napięciem, gdy da się wyłączyć zasilanie. Jeśli przy demontażu starej instalacji okaże się, że przewody są w gorszym stanie, niż sugerowały pomiary, pokazujemy to klientowi przed rozszerzeniem zakresu. Gwarancja na nasze prace to 24 miesiące, a fakturę VAT wystawiamy zawsze.',
    ],
    yearsExperience: 20,
    teamSize: 3,
    warrantyMonths: 24,
    vatInvoice: true,
    availabilityDays: 14,
    projects: [
      {
        title: 'Instalacja elektryczna w nowym domu 150 m², Skierniewice',
        service: 'elektryk',
        locality: 'skierniewice',
        completedMonth: '2026-06',
        description:
          'Kompletna instalacja w domu parterowym z poddaszem użytkowym: 26 obwodów, rozdzielnica główna i podrozdzielnica na poddaszu, okablowanie strukturalne kategorii 6 do każdego pokoju, zasilanie rolet, bramy i ładowarki samochodowej w garażu. Uziemienie fundamentowe i instalacja odgromowa. Pracowaliśmy w dwóch etapach, przed tynkami i po malowaniu, łącznie 9 dni roboczych. Klient dostał 120 zdjęć ścian z przewodami i protokół z pomiarów.',
        photoKind: 'electrical',
        photos: 3,
      },
      {
        title: 'Modernizacja instalacji i nowa rozdzielnica, dom z lat 80. w Łowiczu',
        service: 'elektryk',
        locality: 'lowicz',
        completedMonth: '2025-09',
        description:
          'Dom zamieszkany przez starsze małżeństwo, z instalacją dwużyłową i tablicą z bezpiecznikami topikowymi. W pierwszym etapie wymieniliśmy rozdzielnicę na nową, z wyłącznikami różnicowoprądowymi i ochroną przeciwprzepięciową, w drugim – instalację w kuchni i łazience. Bruzdy cięte z odkurzaczem i zaprawiane tego samego dnia, domownicy nie musieli się wyprowadzać. Oba etapy zajęły łącznie 6 dni roboczych.',
        photoKind: 'electrical',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Marcin, Skierniewice',
        body: 'Instalacja w nowym domu od zera. Najpierw spotkanie nad rzutem domu, na którym rozpisaliśmy każde gniazdko i włącznik. Potem praca zgodnie z harmonogramem, bez blokowania tynkarzy. Przed tynkami dostaliśmy zdjęcia każdej ściany z przewodami. Pomiary i protokół na koniec. Polecam bez zastrzeżeń.',
        reply:
          'Dziękujemy, Panie Marcinie! Zdjęcia ścian warto mieć pod ręką przy wieszaniu szafek 🙂',
        daysAgo: 110,
      },
      {
        rating: 5,
        author: 'Agata, Łowicz',
        body: 'Modernizacja starej instalacji w domu rodziców 👍 Pan Janusz rozłożył prace na dwa etapy, żeby rodzice nie musieli się wyprowadzać. Przemili ludzie 😊',
        daysAgo: 320,
      },
      {
        rating: 3,
        author: 'Robert, Brzeziny',
        body: 'Robota zrobiona dobrze, pomiary są. Trzy gwiazdki, bo umówiony termin rozpoczęcia przesunął się dwa razy, za każdym razem z informacją dzień wcześniej. Rozumiem, że inne budowy się przeciągają, ale trudno było mi zgrać pozostałe ekipy.',
        reply:
          'Panie Robercie, przepraszamy za te przesunięcia. Wynikały z opóźnień tynkarzy na innej budowie, od których zależał nasz kolejny etap. Wprowadziliśmy zasadę, że o zmianie terminu informujemy co najmniej trzy dni wcześniej.',
        daysAgo: 210,
      },
      {
        rating: 5,
        author: 'Joanna, okolice Skierniewic',
        body: 'Przegląd instalacji z pomiarami dla ubezpieczyciela – szybko, konkretnie, protokół jeszcze tego samego dnia ✅',
        daysAgo: 9,
      },
    ],
  },
  // 16
  {
    name: 'Cegła po Cegle Bełchatów',
    services: ['murarz', 'tynkarz', 'posadzki'],
    baseLocality: 'belchatow',
    serviceArea: ['belchatow', 'piotrkow-trybunalski', 'radomsko', 'zdunska-wola'],
    shortDescription:
      'Stany surowe domów jednorodzinnych, murowanie ścian i kominów, tynki maszynowe i wylewki anhydrytowe. Doświadczona dziewięcioosobowa brygada z Bełchatowa i dokumentacja każdego etapu.',
    about: [
      'Cegła po Cegle to firma budowlana z Bełchatowa, którą od 1998 roku prowadzi Ryszard Pawlak, murarz z zawodu i technik budownictwa z wykształcenia. W jego brygadzie pracuje dziewięć osób – murarze, cieśla szalunkowy, tynkarze i operator agregatu do wylewek. Część z nich jest w firmie od ponad piętnastu lat, a dwóch młodszych pracowników to synowie dawnych murarzy z tej samej brygady. Firma działa w Bełchatowie, Piotrkowie, Radomsku i Zduńskiej Woli, budując głównie domy jednorodzinne i budynki gospodarcze.',
      'Główny zakres to stan surowy otwarty i zamknięty: fundamenty, ściany z bloczków silikatowych, ceramiki lub betonu komórkowego, wieńce i nadproża, stropy gęstożebrowe i monolityczne, kominy i ścianki kolankowe. Po stanie surowym firma wraca na budowę z tynkami maszynowymi gipsowymi lub cementowo-wapiennymi oraz wylewkami anhydrytowymi i cementowymi, także na ogrzewanie podłogowe. Dzięki temu inwestor ma jednego wykonawcę na kilka kluczowych etapów i nie musi szukać, kto odpowiada za krzywą ścianę albo pękniętą wylewkę.',
      'Ryszard przywiązuje dużą wagę do dokumentacji. Na każdą budowę prowadzony jest zeszyt z datami betonowań, warunkami pogodowymi i zdjęciami zbrojenia przed zalaniem. Inwestor dostaje te zdjęcia na bieżąco, co tydzień, razem z krótkim podsumowaniem postępów i planem na kolejne dni. Przy odbiorach etapów obecny jest kierownik budowy, a firma przygotowuje listę rzeczy do sprawdzenia, żeby niczego nie pominąć – od rozstawu strzemion po wysokość parapetów.',
      'Na placu budowy obowiązuje porządek: materiał składowany na paletach i przykryty folią, odpady segregowane do kontenera, a drogi dojazdowe utrzymywane tak, żeby nie niszczyć dróg gminnych i posesji sąsiadów. Przy tynkach wewnątrz okna i parapety zabezpieczane są folią, a po zakończeniu prac budynek jest sprzątany przed wejściem kolejnych ekip. Ryszard mówi, że po porządku na budowie od razu widać, jak będą wyglądały ściany. Na każdej budowie wisi tablica z numerem telefonu do brygadzisty, a sąsiedzi wiedzą, do kogo dzwonić, gdy betonowóz zastawi im wjazd.',
      'Przy wylewkach firma robi wszystko według sztuki: dylatacje obwodowe i strefowe, folia, siatka przy ogrzewaniu podłogowym, pomiar wilgotności przed oddaniem do dalszych prac. Wylewki anhydrytowe są szlifowane po kilku dniach, żeby usunąć mleczko, które później utrudnia przyczepność kleju. Inwestor dostaje harmonogram wygrzewania podłogówki i zalecenia, kiedy można kłaść płytki, a kiedy parkiet, wraz z wynikami pomiarów. W garażach i kotłowniach wylewki cementowe są dodatkowo zbrojone włóknami i zacierane mechanicznie, żeby były odporne na ścieranie.',
      'Wielu inwestorów buduje swój pierwszy dom i nie wie, o co pytać, dlatego Ryszard przed podpisaniem umowy spotyka się z nimi na działce i przechodzi przez projekt krok po kroku. Wskazuje miejsca, w których projekt da się poprawić bez dużych kosztów – na przykład przesunięcie otworu okiennego, by zmieściła się szafa, albo dodatkowy kanał wentylacyjny w kominie. Pomaga też ułożyć kolejność zamawiania materiałów, tak żeby nic nie leżało na placu miesiącami. Zdarza się, że po takiej rozmowie inwestor sam decyduje się przesunąć start budowy o kilka tygodni, żeby najpierw dopracować projekt – i zwykle na tym zyskuje.',
      'Firma nie podejmuje się budowy bez projektu i kierownika budowy, nie muruje w temperaturze poniżej zera bez odpowiednich dodatków i zabezpieczeń i nie wykonuje drobnych pojedynczych prac w rodzaju przemurowania jednego otworu. Kalendarz jest ustalany z wyprzedzeniem nawet kilkumiesięcznym, dlatego zamiast najbliższego wolnego terminu Ryszard woli zaproponować konkretny miesiąc po obejrzeniu projektu. Gwarancja na prace wynosi 36 miesięcy.',
    ],
    yearsExperience: 28,
    teamSize: 9,
    warrantyMonths: 36,
    vatInvoice: true,
    availabilityDays: null,
    projects: [
      {
        title: 'Stan surowy zamknięty domu 132 m² z poddaszem, Bełchatów',
        service: 'murarz',
        locality: 'belchatow',
        completedMonth: '2025-10',
        description:
          'Dom z poddaszem użytkowym: ławy fundamentowe, ściany z bloczków silikatowych 18 cm, strop gęstożebrowy, wieńce, ścianki kolankowe i komin systemowy z kanałami wentylacyjnymi. Zdjęcia zbrojenia przed każdym betonowaniem trafiały do inwestora i kierownika budowy. Stan surowy otwarty zajął 11 tygodni, a po montażu więźby i okien przez inne ekipy – zamknęliśmy budynek w kolejne 2 tygodnie.',
        photoKind: 'brick',
        photos: 3,
      },
      {
        title: 'Tynki maszynowe i wylewka anhydrytowa pod podłogówkę, dom w Radomsku',
        service: 'posadzki',
        locality: 'radomsko',
        completedMonth: '2026-03',
        description:
          'Tynki gipsowe maszynowe na ścianach i sufitach, około 540 m², a po nich wylewka anhydrytowa 5 cm na ogrzewaniu podłogowym w całym domu. Dylatacje obwodowe i w progach drzwiowych, szlifowanie wylewki po 5 dniach. Inwestor dostał harmonogram wygrzewania i wyniki pomiaru wilgotności po 4 tygodniach. Tynki zajęły 7 dni roboczych, wylewka – jeden dzień plus szlifowanie.',
        photoKind: 'floor',
        photos: 2,
      },
      {
        title: 'Komin systemowy i ściany garażu, Piotrków',
        service: 'murarz',
        locality: 'piotrkow-trybunalski',
        completedMonth: '2025-05',
        description:
          'Dobudowa garażu dwustanowiskowego do istniejącego domu: fundamenty, ściany z bloczków betonowych, wieniec i strop monolityczny, a do tego komin systemowy z kanałem dymowym pod kominek i dwoma kanałami wentylacyjnymi. Połączenie z istniejącą ścianą domu wykonaliśmy z dylatacją. Prace murarskie trwały 4 tygodnie, z tygodniową przerwą na dojrzewanie betonu stropu.',
        photoKind: 'brick',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Krzysztof, Bełchatów',
        body: 'Budowaliśmy dom z poddaszem i pan Ryszard z ekipą postawił nam stan surowy zamknięty. Co tydzień dostawaliśmy zdjęcia i notatkę: co zrobione, jakie betonowania, jaka pogoda. Przed zalaniem stropu kierownik budowy dostał zdjęcia zbrojenia jeszcze przed swoją wizytą. Na budowie porządek, materiał na paletach, nic nie leżało w błocie. Polecam każdemu, kto buduje pierwszy dom.',
        reply: 'Dziękujemy, Panie Krzysztofie. Do zobaczenia przy tynkach i wylewkach!',
        daysAgo: 340,
      },
      {
        rating: 5,
        author: 'Aneta, Radomsko',
        body: 'Tynki i wylewka anhydrytowa pod podłogówkę 💪 Dostaliśmy harmonogram wygrzewania i informację, kiedy można kłaść płytki, a kiedy parkiet. Polecam 👍',
        daysAgo: 160,
      },
      {
        rating: 4,
        author: 'Łukasz, Zduńska Wola',
        body: 'Solidna, doświadczona ekipa. Terminy ustala się z dużym wyprzedzeniem – na start czekaliśmy prawie cztery miesiące – ale potem wszystko szło sprawnie i zgodnie z planem.',
        daysAgo: 250,
      },
    ],
  },
  // 17
  {
    name: 'Poziom Zero Posadzki',
    services: ['posadzki', 'tynkarz'],
    baseLocality: 'lodz-widzew',
    serviceArea: ['lodz-widzew', 'lodz', 'lodz-gorna', 'lodz-srodmiescie', 'brzeziny', 'zgierz'],
    shortDescription:
      'Wylewki cementowe i anhydrytowe, posadzki pod ogrzewanie podłogowe, mikrocement i tynki maszynowe. Mierzymy wilgotność i równość, a wyniki dostajesz na piśmie w karcie posadzki.',
    about: [
      'Poziom Zero powstał w 2016 roku na Widzewie. Jest nas pięciu: dwóch posadzkarzy, dwóch tynkarzy i Kuba, który obsługuje agregat, mieszalnik i pompę do anhydrytu. Robimy wylewki i tynki w nowych domach i mieszkaniach deweloperskich, a coraz częściej także w kamienicach, gdzie trzeba wyrównać stare, krzywe stropy. Działamy w całej Łodzi, w Zgierzu i Brzezinach. Nazwa wzięła się z żartu na pierwszej budowie, ale szybko okazało się, że dobrze opisuje to, na czym nam zależy najbardziej.',
      'Najwięcej wykonujemy wylewek cementowych miksokretem i anhydrytowych pompowanych, w tym na ogrzewanie podłogowe. Zanim wjedziemy z maszyną, sprawdzamy podłoże, poziomy w całym budynku i grubość izolacji, a także to, czy rury podłogówki są dobrze przypięte. Rozkładamy folię, taśmę dylatacyjną przy ścianach i dylatacje strefowe tam, gdzie wymaga tego układ pętli ogrzewania. Poziom wyznaczamy niwelatorem laserowym i reperami, a po wylaniu sprawdzamy równość łatą dwumetrową. W kamienicach z drewnianymi stropami proponujemy lekkie wylewki albo suche jastrychy, bo kilka centymetrów betonu na starych belkach to ryzyko, którego nie warto podejmować.',
      'Drugi kierunek to tynki maszynowe gipsowe i cementowo-wapienne. Przed tynkowaniem montujemy narożniki i listwy przy oknach, a w miejscach styku różnych materiałów dajemy siatkę. Okna, parapety i progi oklejamy folią, a wszystkie puszki elektryczne zabezpieczamy, żeby elektryk nie musiał ich potem wydłubywać ze świeżego tynku. Pracujemy na materiałach Knauf, Baumit i Atlas, dobierając rodzaj tynku do pomieszczenia – w łazienkach i kuchniach częściej cementowo-wapienny.',
      'Każdy klient dostaje od nas kartę posadzki: datę wylania, grubość, rodzaj materiału, pomiar wilgotności po kilku tygodniach i informację, kiedy można kłaść płytki, panele, a kiedy parkiet. Przy ogrzewaniu podłogowym dołączamy harmonogram wygrzewania z temperaturami na każdy dzień. Wydaje się, że to drobiazg, ale to właśnie wilgotność wylewki jest najczęstszą przyczyną problemów z podłogami, za które potem obwinia się parkieciarza albo producenta paneli. Za zgodą klienta kartę przekazujemy też ekipie, która będzie kłaść podłogę – dzięki temu nikt nie musi zgadywać. Wylewki i tynki rozliczamy według pomiaru po wykonaniu, a nie z projektu, więc klient płaci za to, co faktycznie zostało zrobione.',
      'W mieszkaniach w blokach i kamienicach pracujemy w trybie, który nie przeszkadza sąsiadom: agregat stoi przed budynkiem, wąż prowadzimy zabezpieczoną klatką, a po zakończeniu myjemy schody. Mieszkanie 60 m² wylewamy zwykle w jeden dzień, tynki zajmują dwa–trzy dni. Zdjęcia postępu prac i pomiarów wysyłamy klientowi na bieżąco, a na koniec każdego dnia nasz brygadzista robi zdjęcia klatki i balkonu, żeby było widać, w jakim stanie je zostawiamy.',
      'Od dwóch lat robimy też mikrocement na podłogach i ścianach – w łazienkach, salonach i na schodach, tam gdzie klient chce mieć jednolitą powierzchnię bez fug. To technologia, która nie wybacza pośpiechu, dlatego zawsze najpierw pokazujemy próbki na płytach w kilku odcieniach i fakturach, a potem nakładamy warstwy z przerwami technologicznymi. Klient dostaje instrukcję pielęgnacji i zestaw do odświeżenia powłoki, bo mikrocement, jak drewno, lubi regularną opiekę.',
      'Nie wykonujemy posadzek przemysłowych w halach, posadzek żywicznych w garażach podziemnych ani wylewek na podłożach, których nośności nie da się sprawdzić. Jeśli po zerwaniu starej podłogi wychodzi na przykład strop z belkami w złym stanie, wstrzymujemy prace i polecamy konstruktora, zamiast wylewać ciężką warstwę na słaby strop. Odbiór kończymy protokołem, a gwarancja na nasze wylewki i tynki wynosi 24 miesiące.',
    ],
    yearsExperience: 10,
    teamSize: 5,
    warrantyMonths: 24,
    vatInvoice: true,
    availabilityDays: 4,
    projects: [
      {
        title: 'Wylewka anhydrytowa na podłogówkę, dom 140 m² w Brzezinach',
        service: 'posadzki',
        locality: 'brzeziny',
        completedMonth: '2026-05',
        description:
          'Wylewka anhydrytowa 5 cm na ogrzewaniu podłogowym w całym domu parterowym, pompowana w jeden dzień. Przed wylaniem sprawdziliśmy mocowanie pętli i ciśnienie w instalacji, rozłożyliśmy folię i taśmy dylatacyjne, a w drzwiach wykonaliśmy dylatacje strefowe. Po 4 dniach szlifowanie z odpylaniem. Klienci dostali kartę posadzki i harmonogram wygrzewania na 21 dni, a po 5 tygodniach – pomiar wilgotności.',
        photoKind: 'floor',
        photos: 3,
      },
      {
        title: 'Mikrocement w łazience i salonie, loft 85 m² na Widzewie',
        service: 'posadzki',
        locality: 'lodz-widzew',
        completedMonth: '2025-12',
        description:
          'Mieszkanie w dawnej przędzalni: mikrocement w kolorze ciepłej szarości na podłodze salonu, w łazience na podłodze i ścianach prysznica oraz na froncie wyspy kuchennej. Najpierw wyrównanie podłoża i siatka zbrojąca, potem cztery warstwy z przerwami technologicznymi i lakier poliuretanowy. Przed startem klient wybrał odcień z trzech próbek na płytach. Prace trwały 9 dni roboczych.',
        photoKind: 'floor',
        photos: 3,
      },
      {
        title: 'Tynki gipsowe maszynowe, mieszkanie 68 m² na Górnej',
        service: 'tynkarz',
        locality: 'lodz-gorna',
        completedMonth: '2025-04',
        description:
          'Mieszkanie w stanie deweloperskim z surowymi ścianami z bloczków: tynk gipsowy maszynowy na ścianach i sufitach, około 260 m². Przed tynkowaniem zamontowaliśmy narożniki aluminiowe i listwy przyokienne, okleiliśmy okna, a puszki elektryczne zabezpieczyliśmy pokrywkami. Agregat stał przed budynkiem, a klatkę po pracy umyliśmy. Tynki zajęły 3 dni robocze, ściany były gotowe do malowania po gruntowaniu.',
        photoKind: 'plaster',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Ola, Brzeziny',
        body: 'Wylewka anhydrytowa w całym domu zrobiona w jeden dzień ✅ Dostaliśmy kartę posadzki z pomiarami i harmonogram wygrzewania podłogówki. Parkieciarz był zachwycony 👍',
        reply: 'Dziękujemy, Pani Olu! Pozdrowienia dla parkieciarza 🙂',
        daysAgo: 120,
      },
      {
        rating: 5,
        author: 'Tadeusz, Widzew',
        body: 'Mikrocement w łazience i salonie w lofcie. Bałem się, że wyjdą smugi i pęknięcia, ale po prawie roku powierzchnia wygląda jak pierwszego dnia. Ekipa wcześniej pokazała próbki na płytach i dokładnie wytłumaczyła, jak dbać o powierzchnię.',
        daysAgo: 270,
      },
      {
        rating: 3,
        author: 'Kinga, Górna',
        body: 'Tynki równe, ładne narożniki, puszki elektryczne zabezpieczone. Trzy gwiazdki za porządek: zostały zachlapane parapety na balkonie i ślady na schodach klatki, które musiałam zgłaszać. Ekipa doczyściła, ale nie powinnam o to prosić.',
        reply:
          'Pani Kingo, dziękujemy za opinię i przepraszamy. To nie jest nasz standard. Od tamtej pory na koniec każdego dnia brygadzista robi zdjęcia klatki i balkonu i wysyła je klientowi.',
        daysAgo: 360,
      },
      {
        rating: 4,
        author: 'Mirek, Zgierz',
        body: 'Wylewka cementowa na parterze domu, wszystko w poziomie, sprawnie i bez opóźnień 💪',
        daysAgo: 45,
      },
    ],
  },
  // 18
  {
    name: 'Barwy Domu Radomsko',
    services: ['malarz'],
    baseLocality: 'radomsko',
    serviceArea: ['radomsko', 'belchatow', 'piotrkow-trybunalski'],
    shortDescription:
      'Malowanie mieszkań, domów i lokali w Radomsku i okolicy: gładzie, farby lateksowe i ceramiczne, tapety, efekty dekoracyjne. Małżeński duet, który nie boi się ciemnych i trudnych kolorów.',
    about: [
      'Barwy Domu to firma Natalii i Michała Kaczmarków z Radomska, założona w 2021 roku. Natalia jest z wykształcenia plastyczką i zanim zajęła się malowaniem ścian, pracowała w sklepie z farbami, gdzie godzinami dobierała klientom odcienie. Michał przez lata był malarzem w ekipach remontowych w Bełchatowie. Razem tworzą duet, w którym ona odpowiada za kolory, wzory i tapety, a on za przygotowanie ścian i organizację pracy. Oboje mówią, że najlepsze zlecenia to te, w których klient przychodzi z jednym zdjęciem z internetu i zostawia im resztę.',
      'Firma maluje mieszkania, domy, biura i lokale usługowe w Radomsku, Bełchatowie i Piotrkowie. Typowe zlecenie to odświeżenie mieszkania lub domu – zdjęcie starych tapet, naprawa ubytków, gładź, gruntowanie i dwukrotne malowanie. Coraz częściej klienci zamawiają też efekty dekoracyjne: ściany w dwóch kolorach z geometrycznym podziałem, łuki malowane nad łóżkiem lub biurkiem, fototapety i farby o strukturze tynku wapiennego. W lokalach usługowych pracują wieczorami i w weekendy, żeby nie zamykać firmy klienta. Natalia ma też katalog zdjęć dawnych realizacji z nazwami kolorów, który klient może przejrzeć na tablecie podczas pierwszej wizyty.',
      'Natalia zawsze proponuje malowanie próbek na ścianie – w kilku miejscach pomieszczenia i w dwóch, trzech odcieniach. Jej zdaniem najwięcej rozczarowań bierze się z kolorów wybranych z małego wzornika w sklepowym świetle. Przy ciemnych barwach, które firma szczególnie lubi – butelkowa zieleń, granat, terakota, śliwka – Michał stosuje podkład barwiony, dzięki czemu kolor jest głęboki i równy już po dwóch warstwach. Klient dostaje też kartkę z nazwami i numerami wszystkich użytych farb.',
      'Przed pracą meble są przesuwane na środek i owijane folią, podłogi zabezpieczane tekturą lub włókniną, a gniazdka i włączniki demontowane. Szlifowanie gładzi odbywa się szlifierką z odkurzaczem przemysłowym, a taśmy malarskie zdejmowane są, gdy farba jest jeszcze lekko wilgotna, żeby nie zrywały krawędzi. Na koniec dnia mieszkanie jest odkurzane, a klient dostaje zdjęcie tego, co zostało zrobione, i informację o planie na następny dzień.',
      'Kalendarz firma prowadzi tak, żeby jedno zlecenie było realizowane od początku do końca bez przerw – nie zaczyna kolejnej roboty, zanim nie skończy poprzedniej. Dzięki temu dwupokojowe mieszkanie zajmuje 4–6 dni roboczych, a klient wie, kiedy będzie mógł wrócić do domu. Ma to swoją cenę: najbliższy wolny termin bywa odległy o kilka tygodni. Natalia i Michał uważają jednak, że lepiej powiedzieć to uczciwie, niż zaczynać trzy prace naraz i żadnej nie skończyć.',
      'Odbiór odbywa się przy dziennym świetle i z lampą, a ewentualne poprawki są robione od razu, jeszcze przed spisaniem protokołu. Michał sprawdza krawędzie przy sufitach, narożniki i miejsca przy oknach, gdzie najczęściej widać różnice w kryciu. Resztki farb są opisywane i zostawiane klientowi, a puste puszki i folie firma zabiera ze sobą. Klienci dostają też krótką instrukcję, jak myć ściany pomalowane farbą matową, żeby nie zostawić błyszczących plam. Po kilku miesiącach Natalia dzwoni z pytaniem, czy wszystko w porządku – i zwykle kończy się to rozmową o kolejnym pokoju.',
      'Firma nie maluje elewacji, nie maluje natryskiem w zamieszkanych pomieszczeniach i nie maluje ścian z aktywnym grzybem bez wcześniejszego usunięcia przyczyny zawilgocenia. Jeśli pod tapetą wychodzi odspojony tynk, Michał pokazuje go klientowi i wycenia naprawę, zanim przystąpi do dalszych prac. Na wykonane malowanie firma daje 12 miesięcy gwarancji i wystawia fakturę VAT.',
    ],
    yearsExperience: 5,
    teamSize: 2,
    warrantyMonths: 12,
    vatInvoice: true,
    availabilityDays: 25,
    projects: [
      {
        title: 'Ciemna zieleń i łuk nad łóżkiem – sypialnia 14 m² w Radomsku',
        service: 'malarz',
        locality: 'radomsko',
        completedMonth: '2026-08',
        description:
          'Sypialnia w bloku pomalowana butelkową zielenią na trzech ścianach, a na czwartej – łuk w kolorze ciepłego beżu nad wezgłowiem łóżka. Przed malowaniem gładź na dwóch ścianach, podkład barwiony pod ciemny kolor i próbki w trzech odcieniach. Łuk wyznaczyliśmy cyrklem z linki i taśmą do krzywizn, krawędź poprawiana ręcznie pędzlem. Prace trwały 3 dni robocze.',
        photoKind: 'painting',
        photos: 3,
      },
      {
        title: 'Odświeżenie domu 120 m² z tapetą w holu, Bełchatów',
        service: 'malarz',
        locality: 'belchatow',
        completedMonth: '2025-10',
        description:
          'Malowanie całego domu piętrowego: naprawa rys przy ościeżnicach, gładź w salonie i na klatce schodowej, dwukrotne malowanie farbami lateksowymi, w kuchni farba ceramiczna. W holu tapeta flizelinowa w botaniczny wzór na ścianie przy schodach, z dopasowaniem raportu na wysokości 5 m. Prace trwały 9 dni roboczych bez przerw na inne zlecenia, odbiór przy dziennym świetle i z lampą.',
        photoKind: 'painting',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Klaudia, Radomsko',
        body: 'Pani Natalia pomogła mi wybrać butelkową zieleń do sypialni i namalowała próbki w trzech miejscach 🎨 Łuk nad łóżkiem wyszedł idealnie równy. Jestem zakochana 😊',
        reply:
          'Dziękujemy, Pani Klaudio! Zieleń z łukiem to jedno z naszych ulubionych zleceń w tym roku 🙂',
        daysAgo: 28,
      },
      {
        rating: 5,
        author: 'Arek, Bełchatów',
        body: 'Odświeżenie całego domu z tapetą w holu. Ekipa zaczęła i skończyła w ustalonym terminie, bez przerw na inne zlecenia. Meble owinięte, podłogi zabezpieczone, sprzątanie codziennie. Na koniec odbiór z lampą – dawno nie widziałem, żeby ktoś tak sprawdzał własną robotę.',
        daysAgo: 330,
      },
      {
        rating: 4,
        author: 'Ewa, Piotrków',
        body: 'Ładnie pomalowane mieszkanie, sympatyczni ludzie 👍 Gwiazdka mniej, bo na pierwszy wolny termin czekałam ponad miesiąc.',
        daysAgo: 140,
      },
    ],
  },
  // 19
  {
    name: 'Woda i Ciepło Krawczyk',
    services: ['hydraulik'],
    baseLocality: 'lodz-srodmiescie',
    serviceArea: [
      'lodz-srodmiescie',
      'lodz-polesie',
      'lodz-baluty',
      'lodz-widzew',
      'lodz-gorna',
      'lodz',
    ],
    shortDescription:
      'Instalacje wodne, kanalizacyjne i grzewcze w łódzkich kamienicach i blokach: wymiana pionów, ogrzewanie podłogowe, kotły kondensacyjne zamiast pieców kaflowych. Uprawnienia gazowe i szybkie awarie.',
    about: [
      'Woda i Ciepło Krawczyk działa w Łodzi od 2011 roku. Firmę założył Marcin Krawczyk, instalator z uprawnieniami gazowymi i energetycznymi, który wcześniej pracował w administracji budynków komunalnych i zna od środka setki łódzkich kamienic. Dziś jest nas czterech: dwóch instalatorów, serwisant kotłów i pomocnik. Działamy w Śródmieściu, na Polesiu, Bałutach, Widzewie i Górnej, a nasze auta z zapasem części rozpoznaje już niejeden dozorca. Marcin do dziś trzyma w warsztacie kawałek ołowianej rury z kamienicy w Śródmieściu i pokazuje go klientom, którzy pytają, czy wymiana instalacji naprawdę jest potrzebna.',
      'Kamienice to nasza specjalność. Wiemy, jak wygląda stara instalacja żeliwna i ołowiana, jak bezpiecznie przejść przez stropy z belkami drewnianymi i jak poprowadzić nowe rury, gdy zarządca nie pozwala na kucie ścian nośnych. Wymieniamy całe piony na zlecenie wspólnot i zarządców, a w pojedynczych mieszkaniach – instalacje od pionu do punktów poboru. Przy ogrzewaniu robimy przejścia z pieców kaflowych i węglowych na kotły gazowe kondensacyjne z grzejnikami lub ogrzewaniem podłogowym.',
      'Zanim zaczniemy, robimy wizję lokalną z kamerą inspekcyjną w kanalizacji i sprawdzamy, co kryje się w ścianach. Następnie przygotowujemy kosztorys w dwóch wariantach – minimalnym i docelowym – żeby klient mógł świadomie wybrać, co robi teraz, a co może poczekać. W kamienicach od razu informujemy o tym, czego nie da się przewidzieć bez otwarcia ścian, i ustalamy, jak będziemy postępować, jeśli coś wyjdzie, oraz ile może to kosztować.',
      'Na budowie dbamy o czystość i bezpieczeństwo: folie ochronne na podłogach i meblach, bruzdy cięte z odkurzaczem przemysłowym, zawsze opisane, co i gdzie jest zakręcone. Mieszkańców pionu informujemy z wyprzedzeniem o planowanych przerwach w dostawie wody, wywieszając harmonogram na klatce. Każdą instalację poddajemy próbie ciśnieniowej i zostawiamy klientowi dokumentację zdjęciową z rozprowadzeniem przewodów oraz protokół z próby. Na zaworach zostawiamy zawieszki z opisem, który zawór zamyka które pomieszczenie – to drobiazg, który bardzo pomaga w razie awarii w nocy.',
      'Pracujemy na rurach PEX i wielowarstwowych w systemie zaprasowywanym, kanalizacji niskoszumowej w pionach i armaturze sprawdzonych marek, do której łatwo dostać części. Kotły montujemy tylko te, do których mamy dostęp do serwisu, a uruchomienie robimy sami, z regulacją krzywej grzewczej pod konkretne mieszkanie. Klientom, którzy myślą o pompie ciepła w domu pod Łodzią, pomagamy dobrać urządzenie i przygotować instalację, ale montaż jednostki zlecamy autoryzowanemu partnerowi. Przy ogrzewaniu podłogowym liczymy rozstaw rur osobno dla każdego pomieszczenia, zamiast kłaść wszędzie tak samo.',
      'Przy wymianie pionów we wspólnotach wiemy, że największym problemem nie jest technika, tylko ludzie. Dlatego przed rozpoczęciem prac Marcin spotyka się z zarządem wspólnoty, a jeśli trzeba – z mieszkańcami, i tłumaczy, jak będzie wyglądała praca w ich mieszkaniach, ile potrwa i co trzeba odsłonić. W mieszkaniach starszych osób pracujemy możliwie szybko, a po wszystkim pomagamy postawić z powrotem szafki i pralkę. Uszkodzone przy pracy płytki odtwarzamy na nasz koszt.',
      'Nie podejmujemy się przeróbek gazowych bez projektu i zgody dostawcy gazu, nie zostawiamy instalacji bez próby szczelności i nie montujemy armatury, której nie da się później serwisować. W awariach – przeciek, brak ciepłej wody, zalanie – staramy się być na miejscu w ciągu kilku godzin w Śródmieściu i na Polesiu. Na nasze prace dajemy 24 miesiące gwarancji, a na kotły – gwarancję producenta z serwisem przez nas.',
    ],
    yearsExperience: 15,
    teamSize: 4,
    warrantyMonths: 24,
    vatInvoice: true,
    availabilityDays: 3,
    projects: [
      {
        title: 'Wymiana pionów wodnych i kanalizacyjnych w kamienicy, 12 mieszkań, Śródmieście',
        service: 'hydraulik',
        locality: 'lodz-srodmiescie',
        completedMonth: '2025-08',
        description:
          'Wymiana dwóch pionów kanalizacyjnych żeliwnych na niskoszumowe PP oraz pionów wody zimnej i ciepłej w czteropiętrowej kamienicy, na zlecenie wspólnoty. Prace prowadziliśmy mieszkanie po mieszkaniu według harmonogramu wywieszonego na klatce, a woda w pionie była zakręcona maksymalnie przez 6 godzin dziennie. Uszkodzone płytki przy przejściach odtworzyliśmy. Całość zajęła 4 tygodnie.',
        photoKind: 'plumbing',
        photos: 3,
      },
      {
        title: 'Kocioł kondensacyjny i nowe grzejniki zamiast pieca kaflowego, 58 m² na Polesiu',
        service: 'hydraulik',
        locality: 'lodz-polesie',
        completedMonth: '2026-01',
        description:
          'Mieszkanie w kamienicy ogrzewane dwoma piecami kaflowymi. Zamontowaliśmy kocioł gazowy kondensacyjny dwufunkcyjny w kuchni, z odprowadzeniem spalin do istniejącego kanału po wkładzie, oraz pięć grzejników z zaworami termostatycznymi. Rury poprowadziliśmy w posadzce, żeby nie kuć ścian nośnych. Uruchomienie z regulacją krzywej grzewczej. Prace trwały 6 dni roboczych, łącznie z odbiorem kominiarskim.',
        photoKind: 'plumbing',
        photos: 2,
      },
      {
        title: 'Ogrzewanie podłogowe w mieszkaniu 75 m², Widzew',
        service: 'hydraulik',
        locality: 'lodz-widzew',
        completedMonth: '2025-04',
        description:
          'Ogrzewanie podłogowe wodne w całym mieszkaniu na ostatnim piętrze bloku, zasilane z kotła gazowego. Izolacja ze styropianu, folia z siatką, rury PE-RT w rozstawie 10 cm w łazience i 15 cm w pokojach, rozdzielacz z przepływomierzami w szafce w przedpokoju. Próba ciśnieniowa przy klientce, zdjęcia wszystkich pętli przed wylewką i harmonogram pierwszego uruchomienia. Instalacja zajęła 3 dni robocze.',
        photoKind: 'plumbing',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Halina, Śródmieście',
        body: 'Wymiana pionów w naszej kamienicy, 12 mieszkań. Każdy mieszkaniec dostał wcześniej kartkę z godzinami bez wody, a ekipa trzymała się tego co do godziny. Panowie byli uprzejmi nawet dla najbardziej marudnych sąsiadów 🙏',
        daysAgo: 393,
      },
      {
        rating: 5,
        author: 'Maciek, Polesie',
        body: 'Zamiast pieców kaflowych kocioł kondensacyjny i grzejniki 🔥 Pierwsza zima w cieple bez noszenia węgla. Wszystko wytłumaczone, uruchomione i wyregulowane 👍',
        daysAgo: 250,
      },
      {
        rating: 4,
        author: 'Karol, Bałuty',
        body: 'Fachowa diagnoza z kamerą w kanalizacji, dwie wersje kosztorysu do wyboru. Gwiazdka mniej, bo prace trwały dzień dłużej, niż mówili.',
        daysAgo: 75,
      },
      {
        rating: 5,
        author: 'Ewa, Widzew',
        body: 'Ogrzewanie podłogowe w całym mieszkaniu. Próba ciśnieniowa przy mnie, zdjęcia pętli przed wylewką i harmonogram pierwszego uruchomienia. Po półtora roku działa bez zarzutu.',
        reply:
          'Dziękujemy, Pani Ewo! Przed sezonem grzewczym warto odpowietrzyć rozdzielacz – chętnie pokażemy jak 🙂',
        daysAgo: 30,
      },
      {
        rating: 5,
        author: 'Patryk, Górna',
        body: 'Awaria podgrzewacza w piątek po południu, serwisant był u mnie w ciągu trzech godzin ✅',
        daysAgo: 6,
      },
    ],
  },
  // 20
  {
    name: 'Nowy Kąt Remonty',
    services: ['remont-mieszkania', 'remont-lazienki', 'elektryk', 'sucha-zabudowa'],
    baseLocality: 'lodz',
    serviceArea: [
      'lodz',
      'lodz-srodmiescie',
      'lodz-widzew',
      'lodz-baluty',
      'lodz-polesie',
      'lodz-gorna',
    ],
    shortDescription:
      'Remonty mieszkań pod klucz w całej Łodzi: instalacje, łazienka, zabudowy G-K, wykończenie. Własna dwunastoosobowa ekipa, kierowniczka prac i cotygodniowy raport ze zdjęciami.',
    about: [
      'Nowy Kąt to łódzka firma remontowa założona w 2008 roku przez Annę i Piotra Zielińskich. Zaczynali jako dwuosobowa ekipa wykończeniowa, dziś zatrudniają dwanaście osób: kierowniczkę prac, elektryka, hydraulika, dwóch glazurników, ekipę od zabudów i gładzi oraz malarzy. Dzięki temu remont mieszkania pod klucz wykonują własnymi siłami, bez długich przerw na szukanie podwykonawców i bez sytuacji, w której jedna ekipa czeka tydzień na drugą. Większość pracowników jest w firmie od ponad pięciu lat, a nowe osoby zaczynają od pracy w parze z kimś doświadczonym.',
      'Firma specjalizuje się w kompleksowych remontach mieszkań w Łodzi – w blokach, kamienicach i nowych budynkach oddawanych w stanie deweloperskim. Zakres obejmuje zmianę układu ścian, nowe instalacje elektryczne i wodne, łazienki, zabudowy G-K, gładzie, malowanie, podłogi, drzwi i montaż mebli kuchennych dostarczonych przez klienta lub stolarza. Klient może przyjść z gotowym projektem od architekta albo skorzystać z prostego projektu funkcjonalnego, który Anna przygotowuje na podstawie pomiaru.',
      'Każdy remont ma swoją kierowniczkę prac, która jest jedynym punktem kontaktu dla klienta. Przed startem powstaje harmonogram w arkuszu: tydzień po tygodniu, z datami decyzji, dostaw materiałów i odbiorów częściowych. Co piątek klient dostaje raport z postępów z kilkunastoma zdjęciami, listą zrobionych rzeczy i planem na kolejny tydzień. Wielu klientów kupuje mieszkania w Łodzi, mieszkając w innym mieście, i właśnie ten raport jest dla nich najważniejszy. Jeśli klient współpracuje z architektem, raport trafia także do niego, żeby wszyscy patrzyli na ten sam stan budowy.',
      'Ekipa pracuje według stałych procedur porządkowych: zabezpieczenie klatki i windy płytami i folią w dniu startu, ściany pyłowe z zamkiem, odkurzacze przemysłowe przy każdym elektronarzędziu, wynoszenie gruzu w workach do kontenera i codzienne sprzątanie. Przed zamknięciem ścian i sufitów wykonywane są zdjęcia instalacji z miarką, a elektryk i hydraulik przekazują protokoły z pomiarów i prób szczelności, które trafiają do teczki klienta.',
      'Niespodzianki w starych budynkach są wpisane w kosztorys jako osobna pozycja rezerwowa, a każda zmiana zakresu jest potwierdzana mailowo z wyceną przed rozpoczęciem pracy – od niedawna zawsze w dwóch wariantach cenowych. Nowy Kąt nie dolicza prac „po fakcie”. Jeśli materiał wybrany przez klienta jest niedostępny lub ma długi termin dostawy, kierowniczka od razu proponuje zamienniki, żeby nie wstrzymywać budowy. Klient ma też dostęp do wspólnej tabeli zakupów, w której widać, co już zamówiono, co dojechało i co czeka na jego decyzję.',
      'Piotr, który sam zaczynał jako glazurnik, pilnuje, żeby łazienki były robione tak samo starannie jak w firmach specjalizujących się wyłącznie w łazienkach: hydroizolacja w dwóch warstwach, spadki w wylewce, próba szczelności przed płytkami i rysunek rozkładu płytek akceptowany przez klienta. Anna z kolei dba o detale wykończenia – listwy, cokoły, kratki wentylacyjne w kolorze ścian, gniazdka w osi szafek. Klienci często mówią, że właśnie te drobiazgi odróżniają Nowy Kąt od innych firm.',
      'Firma nie przyjmuje drobnych pojedynczych zleceń ani remontów poza Łodzią, nie pracuje bez umowy i bez zaliczki na materiały. Kompleksowy remont mieszkania 50–60 m² trwa zwykle 8–11 tygodni, a kalendarz jest zapełniony z około półtoramiesięcznym wyprzedzeniem. Na koniec odbywa się odbiór z protokołem i listą ewentualnych usterek, które są usuwane w ciągu 14 dni. Gwarancja wynosi 36 miesięcy, a faktura VAT jest wystawiana przy każdym etapie.',
    ],
    yearsExperience: 18,
    teamSize: 12,
    warrantyMonths: 36,
    vatInvoice: true,
    availabilityDays: 46,
    projects: [
      {
        title: 'Mieszkanie 62 m² w kamienicy w Śródmieściu – remont pod klucz',
        service: 'remont-mieszkania',
        locality: 'lodz-srodmiescie',
        completedMonth: '2026-07',
        description:
          'Trzypokojowe mieszkanie w kamienicy kupione przez klientkę mieszkającą w Warszawie. Nowe instalacje elektryczne i wodne, przeniesienie kuchni do salonu, łazienka z prysznicem w miejscu dawnej spiżarni, renowacja drewnianych drzwi i jodełki, gładzie i malowanie. Cotygodniowe raporty ze zdjęciami i każda zmiana potwierdzana mailem. Remont trwał 10 tygodni, usterki z protokołu usunęliśmy w 6 dni.',
        photoKind: 'renovation',
        photos: 3,
      },
      {
        title: 'Stan deweloperski 45 m² wykończony pod klucz, Widzew',
        service: 'remont-mieszkania',
        locality: 'lodz-widzew',
        completedMonth: '2025-11',
        description:
          'Dwupokojowe mieszkanie w nowym budynku: dodatkowe obwody elektryczne w kuchni, sufit podwieszany z oświetleniem LED w salonie, łazienka z płytkami 60×120, gładzie i malowanie, panele winylowe, drzwi bezprzylgowe i montaż kuchni od stolarza z wyspą. Wszystkie prace wykonała nasza ekipa, bez podwykonawców. Mieszkanie było gotowe do zamieszkania po 11 tygodniach od odbioru kluczy od dewelopera.',
        photoKind: 'kitchen',
        photos: 3,
      },
      {
        title: 'Nowa instalacja elektryczna i zabudowa G-K, 3 pokoje na Bałutach',
        service: 'elektryk',
        locality: 'lodz-baluty',
        completedMonth: '2025-06',
        description:
          'Wymiana instalacji aluminiowej na miedzianą w bloku z lat 70., z nową rozdzielnicą i osobnymi obwodami dla kuchni i łazienki, a przy okazji – zabudowa G-K wnęki na szafę i obudowa pionów z rewizjami. Elektryk i ekipa od zabudów pracowali na zakładkę, więc przewody w nowych ścianach zostały poprowadzone przed opłytowaniem. Prace trwały 3 tygodnie razem z gładziami.',
        photoKind: 'electrical',
        photos: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        author: 'Magdalena, Śródmieście',
        body: 'Kupiłam mieszkanie w kamienicy, mieszkając w Warszawie, i bałam się remontu na odległość. Kierowniczka prac była jedyną osobą, z którą rozmawiałam, a piątkowe raporty ze zdjęciami pozwalały mi spać spokojnie. Każda zmiana była potwierdzana mailem z ceną. Remont trwał 10 tygodni, tak jak zakładał harmonogram, a usterki z protokołu poprawili w tydzień. Polecam każdemu, kto nie może codziennie doglądać budowy.',
        reply:
          'Pani Magdaleno, dziękujemy za zaufanie! Cieszymy się, że raporty spełniły swoje zadanie 🙂',
        daysAgo: 64,
      },
      {
        rating: 5,
        author: 'Piotr, Widzew',
        body: 'Mieszkanie od dewelopera wykończone pod klucz w niecałe trzy miesiące 👍 Ekipa zgrana, nikt nie zwalał winy na drugiego 🔥',
        daysAgo: 300,
      },
      {
        rating: 4,
        author: 'Natalia, Polesie',
        body: 'Bardzo dobra organizacja i jakość wykonania. Gwiazdka mniej za to, że na termin rozpoczęcia czekałam prawie dwa miesiące, ale było warto 😊',
        daysAgo: 180,
      },
      {
        rating: 3,
        author: 'Igor, Bałuty',
        body: 'Jakość prac dobra, elektryk i ekipa od zabudów znają się na rzeczy. Nie podobało mi się jednak, że kosztorys końcowy był wyższy o sporą część rezerwy – wszystko było potwierdzane mailowo, ale przy kilku zmianach zabrakło mi rozmowy o tańszych alternatywach.',
        reply:
          'Panie Igorze, dziękujemy za uwagi. Zmiany wynikały ze stanu ścian po skuciu tynków i każdą z nich potwierdzaliśmy. Ma Pan jednak rację, że warto proponować tańsze warianty – od tego roku każda zmiana zakresu trafia do klienta w dwóch wersjach cenowych.',
        daysAgo: 330,
      },
      {
        rating: 5,
        author: 'Ania i Tomek, Górna',
        body: 'Remont mieszkania z małym dzieckiem w drodze – ekipa skończyła tydzień przed porodem, tak jak obiecała 🙏⭐',
        daysAgo: 140,
      },
      {
        rating: 5,
        author: 'Damian, Retkinia',
        body: 'Łazienka i nowe instalacje w bloku z wielkiej płyty. Wszystko sprawnie, czysto i zgodnie z planem 💪',
        daysAgo: 22,
      },
    ],
  },
]
