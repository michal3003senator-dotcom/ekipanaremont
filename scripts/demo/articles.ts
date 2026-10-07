/**
 * Artykuły poradnika do danych demonstracyjnych. Treść ogólna i poradnikowa: bez cen jako faktów,
 * z zasadami liczenia materiałów i odwołaniami do przepisów tylko tam, gdzie są pewne.
 */
import type { DocPart } from './doc'

export type SeedCategory = { slug: string; name: string; description: string }
export type SeedArticle = {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  relatedServices: string[]
  daysAgo: number
  parts: DocPart[]
}

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    slug: 'lazienka',
    name: 'Łazienka',
    description: 'Remont łazienki: planowanie, hydroizolacja, płytki i wybór ekipy.',
  },
  {
    slug: 'kuchnia',
    name: 'Kuchnia',
    description: 'Kolejność prac, instalacje i zabudowa – jak zaplanować remont kuchni.',
  },
  {
    slug: 'wykonczenie-wnetrz',
    name: 'Wykończenie wnętrz',
    description: 'Tynki, gładzie, malowanie i podłogi – od surowych ścian do gotowego pokoju.',
  },
  {
    slug: 'instalacje',
    name: 'Instalacje',
    description: 'Elektryka, woda i kanalizacja: co sprawdzić i kiedy wymienić.',
  },
  {
    slug: 'koszty-i-umowy',
    name: 'Koszty i umowy',
    description: 'Umowy z wykonawcami, płatności, odbiór prac i odpowiedzialność za wady.',
  },
  {
    slug: 'dom-i-elewacja',
    name: 'Dom i elewacja',
    description: 'Docieplenie, elewacja i dach – prace przy domu jednorodzinnym.',
  },
]

const bathShower: SeedArticle = {
  slug: 'wymiana-wanny-na-prysznic',
  title: 'Wymiana wanny na prysznic: co sprawdzić przed decyzją',
  excerpt:
    'Brodzik czy odpływ w posadzce, ile miejsca potrzeba na spadek i jak zrobić hydroizolację, żeby woda nie trafiła do sąsiada z dołu.',
  category: 'lazienka',
  tags: ['łazienka', 'prysznic', 'hydroizolacja'],
  relatedServices: ['remont-lazienki', 'hydraulik', 'glazurnik'],
  daysAgo: 4,
  parts: [
    {
      p: 'Zamiana wanny na prysznic to jeden z najczęstszych remontów łazienki w bloku. Zyskujesz miejsce, łatwiejsze wejście i szybszą codzienną kąpiel. Zanim jednak zamówisz kabinę, sprawdź trzy rzeczy: gdzie jest odpływ, ile wysokości masz w podłodze i jak zostanie uszczelniona strefa mokra.',
    },
    { h2: 'Brodzik czy odpływ w posadzce' },
    { p: 'Do wyboru są dwa rozwiązania. Każde ma inne wymagania i inny zakres prac.' },
    {
      ul: [
        '**Brodzik** – gotowa niecka z odpływem. Montaż jest prostszy i szybszy, a brodzik da się postawić prawie wszędzie tam, gdzie stała wanna. Nawet niski brodzik potrzebuje jednak miejsca na syfon.',
        '**Prysznic bez brodzika (walk-in)** – płytki schodzą do odpływu liniowego lub punktowego, a posadzka ma spadek w jego stronę. Wygląda lżej i łatwiej go sprzątać, ale wymaga więcej pracy i precyzji glazurnika.',
      ],
    },
    {
      p: 'W prysznicu bez brodzika posadzka musi mieć spadek w stronę odpływu, zwykle ok. 1–2%. Przy odpływie liniowym wystarczy spadek w jednym kierunku, co ułatwia ułożenie większych płytek. Przy odpływie punktowym podłogę profiluje się w czterech kierunkach.',
    },
    {
      p: 'Zamiast pełnej kabiny często wystarcza stała ścianka ze szkła hartowanego. Zajmuje mniej miejsca i łatwiej ją czyścić, ale musi być pewnie zamocowana. Ścianę z płyt gipsowo-kartonowych trzeba w miejscu mocowania wzmocnić jeszcze przed układaniem płytek – ustal to z ekipą na etapie projektu.',
    },
    { h2: 'Sprawdź odpływ i wysokość podłogi' },
    {
      p: 'To najczęstszy powód, dla którego prysznic bez brodzika w bloku okazuje się trudny. Syfon potrzebuje kilku centymetrów wysokości w warstwach podłogi, a rura od syfonu musi mieć stały spadek w stronę pionu kanalizacyjnego. Im dalej od pionu stoi prysznic, tym wyżej musi być odpływ.',
    },
    {
      ul: [
        'Zmierz, ile miejsca jest od stropu do wierzchu obecnej posadzki. Stropu nie kuje się, żeby zrobić miejsce na syfon – to element konstrukcji budynku.',
        'Sprawdź, gdzie jest pion i czy nowy odpływ da się do niego doprowadzić bez przechodzenia przez ścianę nośną.',
        'Jeśli miejsca brakuje, zostaje podniesienie posadzki w strefie prysznica albo niski brodzik.',
        'Zapytaj o przepustowość odpływu – musi odebrać tyle wody, ile daje deszczownica.',
        'Sprawdź wentylację. Prysznic daje dużo pary, a kratka wentylacyjna musi być drożna.',
      ],
    },
    {
      p: 'Te pomiary zrób razem z hydraulikiem lub glazurnikiem jeszcze przed zakupem odpływu i płytek.',
    },
    { h2: 'Hydroizolacja w strefie mokrej' },
    {
      p: 'Płytki i fugi nie są wodoszczelne. Woda przenika przez fugi, dlatego pod płytkami w strefie prysznica musi być hydroizolacja – szczególnie przy prysznicu bez brodzika, gdzie woda spływa po posadzce.',
    },
    {
      ol: [
        'Podłoże gruntuje się preparatem zalecanym przez producenta hydroizolacji.',
        'W narożnikach i na styku ściany z podłogą wkleja się taśmę uszczelniającą, a na wyjściach rur – mankiety.',
        'Odpływ łączy się z hydroizolacją fabrycznym kołnierzem lub mankietem.',
        'Masę nakłada się zwykle w dwóch warstwach: na podłodze strefy mokrej i na ścianach co najmniej do wysokości deszczownicy.',
        'Płytki klei się po wyschnięciu masy, w czasie podanym przez producenta.',
      ],
    },
    {
      p: 'Ten etap wymaga czasu, bo każda warstwa musi wyschnąć. Ekipa, która obiecuje prysznic bez brodzika „w dwa dni”, powinna wyjaśnić, jak w tym czasie zrobi hydroizolację.',
    },
    { calculator: 'bathroomCost' },
    { h2: 'Najczęstsze pytania' },
    {
      faq: [
        {
          q: 'Czy na wymianę wanny na prysznic potrzebna jest zgoda spółdzielni?',
          a: 'Wymiana wyposażenia w obrębie mieszkania zwykle jej nie wymaga. Sprawdź jednak regulamin spółdzielni lub wspólnoty, a każdą ingerencję w pion kanalizacyjny uzgodnij z zarządcą budynku.',
        },
        {
          q: 'Czy da się wymienić samą wannę bez skuwania całej łazienki?',
          a: 'Czasem tak, ale za wanną zwykle nie ma płytek, a dokupienie identycznych po latach bywa niemożliwe. Licz się z tym, że ściany w strefie prysznica trzeba będzie wykończyć od nowa.',
        },
        {
          q: 'Jak długo to trwa?',
          a: 'Montaż brodzika i kabiny to krótka praca. Prysznic bez brodzika z nowymi płytkami i hydroizolacją zajmuje kilka dni, do tego dochodzi schnięcie kolejnych warstw. Harmonogram ustal z ekipą przed startem.',
        },
        {
          q: 'Kto powinien to zrobić?',
          a: 'Odpływ i podejścia – hydraulik, hydroizolację i płytki – glazurnik. Gdy obie osoby pracują w jednej ekipie, łatwiej ustalić, kto odpowiada za szczelność.',
        },
      ],
    },
    { firms: { service: 'remont-lazienki', locality: 'lodz' } },
  ],
}

const largeTiles: SeedArticle = {
  slug: 'plytki-wielkoformatowe',
  title: 'Płytki wielkoformatowe: o czym pamiętać przed zakupem i układaniem',
  excerpt:
    'Duże płytki wyglądają efektownie, ale wymagają równego podłoża, innego kleju i doświadczonego glazurnika. Sprawdź, co zmienia wielki format.',
  category: 'lazienka',
  tags: ['płytki', 'glazurnik', 'łazienka'],
  relatedServices: ['glazurnik', 'remont-lazienki', 'posadzki'],
  daysAgo: 53,
  parts: [
    {
      p: 'Płytki wielkoformatowe, zwykle od 60×120 cm wzwyż, dają spokojną powierzchnię z niewielką liczbą fug. Na podłodze w salonie czy na ścianie w łazience wyglądają świetnie, pod warunkiem że są dobrze ułożone. Przy dużym formacie każda nierówność podłoża i każda pustka pod płytką są bardziej widoczne, a o pęknięcie łatwiej.',
    },
    { h2: 'Zanim kupisz płytki' },
    {
      ul: [
        '**Transport.** Sprawdź, czy płytka zmieści się w windzie, na klatce schodowej i w drzwiach. Największe formaty często trzeba wnosić schodami, we dwie osoby.',
        '**Partia i kaliber.** Kup cały zapas z jednej partii. Płytki z różnych partii mogą różnić się odcieniem i wymiarem.',
        '**Zapas.** Przyjmij 10–15% zapasu, przy wielkim formacie raczej z górnej granicy, bo jedna uszkodzona lub źle docięta płytka to dużo straconego materiału.',
        '**Rozkład.** Poproś glazurnika o rozrysowanie płytek na ścianach i podłodze. Od rozkładu zależy, czy wąskie docinki nie wypadną w widocznym miejscu.',
        '**Wielkość pomieszczenia.** W małej łazience z wieloma rurami, wnękami i oknem duża płytka oznacza mniej fug, ale też więcej skomplikowanych docinek. Czasem lepiej wypada format nieco mniejszy, dopasowany do wymiarów ścian.',
      ],
    },
    { p: 'Liczbę płytek z zapasem policzysz w kalkulatorze.' },
    { calculator: 'tiles' },
    { h2: 'Co zmienia duży format' },
    {
      table: {
        caption: 'Płytki standardowe i wielkoformatowe – różnice w wykonaniu',
        header: ['Etap', 'Płytki standardowe', 'Wielki format'],
        rows: [
          [
            'Podłoże',
            'drobne nierówności wyrówna klej',
            'musi być bardzo równe, sprawdzone długą łatą',
          ],
          [
            'Klej',
            'cementowy, klasa dobrana do płytki',
            'odkształcalny, zgodny z zaleceniami producenta płytek',
          ],
          ['Nakładanie kleju', 'zwykle na podłoże', 'na podłoże i na spód płytki, bez pustek'],
          ['Poziomowanie', 'krzyżyki i łata', 'system poziomujący z klipsami i klinami'],
          [
            'Narzędzia',
            'typowa przecinarka',
            'długa przecinarka, przyssawki, rama do przenoszenia',
          ],
          ['Ekipa', 'często jedna osoba', 'przy największych formatach dwie osoby'],
        ],
      },
    },
    { h2: 'Na co uważać przy układaniu' },
    {
      p: 'Najważniejsze jest pełne podparcie płytki. Klej nakłada się metodą kombinowaną: grzebieniem na podłoże i cienką warstwą na spód płytki. Pustka pod dużą płytką to miejsce, w którym płytka może pęknąć pod obciążeniem albo przy zmianie temperatury.',
    },
    {
      ul: [
        'Podłoże sprawdza się łatą o długości co najmniej 2 m. Dopuszczalne odchyłki dla danego formatu podają producenci płytek i kleju.',
        'Wylewka musi być sucha. Orientacyjnie wylewka cementowa schnie ok. 1 cm grubości na tydzień, ale przed klejeniem warto zmierzyć jej wilgotność.',
        'Przy ogrzewaniu podłogowym wylewkę wygrzewa się przed klejeniem według instrukcji, a klej musi być przeznaczony do takiego podłoża.',
        'Przy ścianach i na dużych powierzchniach zostawia się dylatacje. Fuga może być wąska, ale nie zerowa.',
        'Otwory na rury i puszki wycina się koronkami diamentowymi, a nie szlifierką „na oko”.',
      ],
    },
    { h3: 'Duże płytki w łazience' },
    {
      p: 'W prysznicu bez brodzika dużą płytkę trudno wyprofilować w czterech kierunkach do odpływu punktowego. Lepiej sprawdza się odpływ liniowy przy ścianie i spadek w jedną stronę. Pod płytkami w strefie mokrej musi być hydroizolacja – duży format niczego tu nie zmienia.',
    },
    { h2: 'Najczęstsze pytania' },
    {
      faq: [
        {
          q: 'Czy każdy glazurnik układa wielki format?',
          a: 'Nie każdy ma doświadczenie i sprzęt. Zapytaj o wcześniejsze realizacje z płytkami tego rozmiaru i o to, jak ekipa przygotuje podłoże.',
        },
        {
          q: 'Czy ułożenie wielkiego formatu kosztuje więcej?',
          a: 'Zwykle tak, bo praca wymaga lepszego kleju, dokładniejszego podłoża i często dwóch osób. Poproś o wycenę z rozbiciem na przygotowanie podłoża, materiały i robociznę.',
        },
        {
          q: 'Czy można kłaść duże płytki na stare płytki?',
          a: 'Czasem tak, jeśli stare płytki mocno się trzymają, a powierzchnia jest równa i nośna. Decyzję podejmuje glazurnik po sprawdzeniu podłoża, a producent kleju musi dopuszczać takie zastosowanie.',
        },
        {
          q: 'Kiedy można chodzić po świeżo ułożonej podłodze?',
          a: 'Czas, po którym podłoga przenosi ruch pieszy i po którym można fugować, podaje producent kleju na opakowaniu. Przy dużych płytkach nie skracaj go – nacisk na jeden róg może ruszyć płytkę, zanim klej zwiąże.',
        },
      ],
    },
    { firms: { service: 'glazurnik', locality: 'lodz' } },
  ],
}

const kitchenOrder: SeedArticle = {
  slug: 'remont-kuchni-kolejnosc-prac',
  title: 'Remont kuchni krok po kroku: kolejność prac',
  excerpt:
    'Od projektu zabudowy po podłączenie zmywarki. Kolejność, dzięki której nie trzeba kuć świeżych ścian ani przesuwać gniazdek pod gotowe szafki.',
  category: 'kuchnia',
  tags: ['kuchnia', 'planowanie', 'kolejność prac'],
  relatedServices: ['remont-mieszkania', 'stolarz', 'elektryk', 'hydraulik'],
  daysAgo: 15,
  parts: [
    {
      p: 'W kuchni spotykają się prawie wszystkie branże: hydraulik, elektryk, glazurnik, malarz i stolarz albo monter mebli. Najdroższe błędy wynikają z pomylonej kolejności – gniazdko schowane za szafką, odpływ w miejscu zmywarki, meble zamówione według wymiarów sprzed tynkowania.',
    },
    { h2: 'Zacznij od projektu zabudowy' },
    {
      p: 'Projekt mebli to punkt wyjścia dla instalacji. Zanim ktokolwiek zacznie kuć, musisz wiedzieć, gdzie stanie zlewozmywak, zmywarka, płyta, piekarnik, lodówka i okap.',
    },
    {
      ul: [
        'Zaznacz na rysunku położenie i wysokość gniazdek nad blatem oraz zasilania płyty, piekarnika, zmywarki i lodówki.',
        'Ustal miejsce odpływu i zaworów pod zlewem.',
        'Sprawdź w instrukcji płyty indukcyjnej, jakiego zasilania wymaga. Zwykle potrzebny jest osobny obwód, często trójfazowy – elektryk oceni, czy instalacja w mieszkaniu na to pozwala.',
        'Zaplanuj oświetlenie blatu, np. listwy LED pod szafkami, i doprowadź do niego zasilanie przed zamknięciem ścian.',
      ],
    },
    { h2: 'Kolejność prac' },
    {
      table: {
        caption: 'Typowa kolejność remontu kuchni',
        header: ['Etap', 'Kto', 'Na co uważać'],
        rows: [
          [
            'Demontaż zabudowy, skucie płytek',
            'ekipa remontowa',
            'odcięcie wody i prądu, wywóz gruzu',
          ],
          [
            'Instalacje wodne i elektryczne',
            'hydraulik, elektryk',
            'zgodnie z projektem mebli, zdjęcia przed zakryciem',
          ],
          [
            'Tynki, gładzie, wylewka',
            'tynkarz, ekipa remontowa',
            'czas schnięcia przed kolejnymi pracami',
          ],
          ['Podłoga', 'glazurnik lub ekipa od podłóg', 'płytki najlepiej pod całą zabudową'],
          ['Pomiar mebli', 'stolarz lub producent mebli', 'po wykończeniu ścian i podłogi'],
          ['Malowanie', 'malarz', 'przed montażem mebli'],
          ['Montaż mebli i blatu', 'stolarz, monter', 'wycięcia na zlew i płytę według instrukcji'],
          ['Płytki lub panel nad blatem', 'glazurnik', 'po montażu blatu'],
          [
            'Podłączenie sprzętu i armatury',
            'hydraulik, elektryk',
            'sprawdzenie szczelności i obwodów',
          ],
        ],
      },
    },
    { h2: 'Instalacje: tu nie ma miejsca na skróty' },
    {
      p: 'Instalacje robi się przed tynkami i gładziami, bo każda późniejsza zmiana oznacza kucie gotowej ściany. Zanim ściany zostaną zamknięte, zrób zdjęcia przebiegu rur i przewodów z miarką w kadrze. Przydadzą się przy wieszaniu szafek i przy każdej naprawie.',
    },
    {
      ul: [
        '**Gaz.** Przeróbki instalacji gazowej, przeniesienie kuchenki albo odcięcie gazu przy przejściu na indukcję wykonuje wyłącznie instalator z uprawnieniami. Po pracach instalację sprawdza się pod kątem szczelności.',
        '**Wentylacja.** Kratka wentylacyjna musi pozostać drożna. Okapu nie montuje się tak, żeby blokował wentylację grawitacyjną. W kuchni z urządzeniem gazowym zasady są ostrzejsze – ustal je z instalatorem lub kominiarzem.',
        '**Elektryka.** Gniazdka nad blatem rozplanuj z zapasem, a duże urządzenia rozdziel na obwody według zaleceń elektryka.',
        '**Woda.** Pod zlewem przewidź osobne zawory dla baterii i zmywarki, żeby w razie awarii nie zakręcać wody w całym mieszkaniu.',
      ],
    },
    { h2: 'Podłoga pod meblami i pomiar zabudowy' },
    {
      p: 'Płytki najlepiej położyć pod całą zabudową. Kuchnię łatwiej wtedy kiedyś przebudować, a wymiana zmywarki nie wymaga walki z różnicą poziomów. Paneli pływających zwykle nie układa się pod ciężką zabudową, bo meble blokują ich pracę – kończy się je przy cokole, z dylatacją.',
    },
    {
      p: 'Ostateczny pomiar mebli zleć dopiero po wykończeniu ścian i podłogi. Tynk i płytki zmieniają wymiary wnęki o centymetry, a meble robione na wymiar nie wybaczają takich różnic. Jeśli chcesz zamówić meble wcześniej, ustal z producentem pomiar wstępny i kontrolny.',
    },
    {
      ul: [
        '**Blat z kamienia lub spieku** zwykle mierzy się dopiero po zamontowaniu szafek, a jego wykonanie trwa. Zapytaj o termin i zaplanuj na ten czas blat tymczasowy albo przerwę w pracach.',
        '**Zlew podwieszany lub wpuszczany w blat** wybierz przed pomiarem blatu, bo od niego zależy wycięcie.',
        '**Przerwa w gotowaniu.** Remont kuchni oznacza kilka tygodni bez niej. Przygotuj prowizoryczne stanowisko w innym pomieszczeniu: czajnik, mała płyta elektryczna, dostęp do wody w łazience.',
      ],
    },
    {
      p: 'Kiedy kuchnia jest już skończona, sprawdź działanie wszystkich gniazdek, szczelność połączeń pod zlewem i domykanie frontów. Usterki wpisz do protokołu odbioru, zanim zapłacisz ostatnią część wynagrodzenia.',
    },
    { firms: { service: 'remont-mieszkania', locality: 'lodz' } },
  ],
}

const paintPrep: SeedArticle = {
  slug: 'przygotowanie-mieszkania-do-malowania',
  title: 'Jak przygotować mieszkanie do malowania',
  excerpt:
    'Co zrobić przed przyjściem malarza: zabezpieczyć podłogi i meble, sprawdzić starą farbę, naprawić ściany i policzyć, ile farby kupić.',
  category: 'wykonczenie-wnetrz',
  tags: ['malowanie', 'ściany', 'farba'],
  relatedServices: ['malarz', 'remont-mieszkania'],
  daysAgo: 9,
  parts: [
    {
      p: 'Efekt malowania zależy bardziej od przygotowania niż od samej farby. Nawet najlepsza farba nie ukryje tłustej plamy, łuszczącej się powłoki ani źle zaszpachlowanej dziury. Część prac możesz zrobić sam przed przyjściem malarza, część należy do niego. Przy wycenie ustalcie:',
    },
    {
      ul: [
        'kto opróżnia i zabezpiecza pomieszczenia,',
        'czy cena obejmuje szpachlowanie, szlifowanie i gruntowanie,',
        'kto kupuje farbę i ile warstw obejmuje wycena,',
        'kto sprząta po pracach i wynosi odpady.',
      ],
    },
    { h2: 'Opróżnij i zabezpiecz pomieszczenie' },
    {
      ol: [
        'Wynieś, co się da. Meble, których nie da się wynieść, przesuń na środek pokoju i przykryj folią.',
        'Zdejmij karnisze, obrazy, haczyki i lampy. Zaznacz otwory po kołkach, jeśli chcesz wieszać rzeczy w tych samych miejscach.',
        'Wyłącz bezpiecznik i zdejmij ramki gniazdek oraz włączników albo dokładnie zabezpiecz je taśmą.',
        'Podłogę przykryj folią malarską z warstwą chłonną albo tekturą. Cienka folia jest śliska i łatwo ją przedziurawić.',
        'Okleij taśmą malarską listwy, ościeżnice, parapety i krawędź sufitu, jeśli ma zostać w innym kolorze.',
      ],
    },
    { h2: 'Sprawdź ściany i starą farbę' },
    {
      p: 'Zanim kupisz farbę, zrób dwa proste testy. **Test taśmy:** przyklej mocną taśmę, dociśnij i szybko zerwij. Jeśli zostaną na niej płaty farby, starą powłokę trzeba usunąć tam, gdzie słabo się trzyma. **Test dłoni:** przetrzyj ścianę ręką. Jeśli zostaje biały pył, na ścianie jest prawdopodobnie farba klejowa lub kredowa – trzeba ją zmyć, bo nowa farba nie będzie się jej trzymać.',
    },
    {
      table: {
        caption: 'Typowe problemy na ścianach i co z nimi zrobić',
        header: ['Problem', 'Co zrobić przed malowaniem'],
        rows: [
          ['Tłuste plamy, np. w kuchni', 'umyć środkiem odtłuszczającym i spłukać'],
          ['Zacieki po zalaniu', 'usunąć przyczynę, osuszyć, pokryć farbą izolującą plamy'],
          ['Pleśń w narożnikach', 'usunąć preparatem grzybobójczym i poprawić wentylację'],
          ['Rysy i dziury po kołkach', 'poszerzyć, wypełnić masą szpachlową, przeszlifować'],
          ['Łuszcząca się farba', 'zeskrobać do nośnej warstwy i wyrównać krawędzie'],
          ['Krzywe ściany', 'gładź albo tynk – praca dla tynkarza lub malarza'],
        ],
      },
    },
    {
      p: 'Po szpachlowaniu ściany szlifuje się, odkurza i gruntuje. Grunt wyrównuje chłonność podłoża, dzięki czemu farba kryje równo. Grunt lub farbę podkładową dobierz według zaleceń producenta farby nawierzchniowej. Jeśli ściany są wyraźnie krzywe, sprawdź, [czy wystarczy gładź, czy potrzebny jest tynk](/artykuly/gladz-czy-tynk).',
    },
    { h2: 'Ile farby kupić' },
    {
      p: 'Wydajność zawsze bierz z etykiety lub karty technicznej konkretnej farby – różni się między produktami i zależy od podłoża.',
    },
    {
      ol: [
        'Policz powierzchnię ścian: obwód pokoju razy wysokość, minus okna i drzwi. Sufit to długość razy szerokość.',
        'Pomnóż wynik przez 2, bo standardowo maluje się dwie warstwy.',
        'Podziel przez wydajność z etykiety (m² z litra) i dodaj niewielki zapas na poprawki.',
      ],
    },
    {
      p: 'Przykład: pokój 4 × 3,5 m o wysokości 2,6 m ma obwód 15 m, więc ściany to ok. 39 m². Po odjęciu okna i drzwi zostaje ok. 35 m², a przy dwóch warstwach – 70 m². Jeśli producent podaje wydajność 10 m² z litra, potrzeba ok. 7 l farby. Na świeżej, chłonnej gładzi zużycie będzie większe niż na ścianie już malowanej.',
    },
    {
      p: 'Przy zmianie koloru z ciemnego na jasny dwie warstwy mogą nie wystarczyć. Wtedy pomaga farba podkładowa albo trzecia warstwa – uwzględnij to w zakupach i w wycenie.',
    },
    { calculator: 'paint' },
    { h2: 'W dniu malowania' },
    {
      ul: [
        'Sprawdź na etykiecie dopuszczalną temperaturę i wilgotność oraz czas między warstwami. Nie przyspieszaj schnięcia grzejnikiem ani termowentylatorem.',
        'Zacznij od sufitu, potem maluj ściany. Każdą ścianę prowadź bez przerwy od narożnika do narożnika, łącząc mokre z mokrym – inaczej po wyschnięciu widać pasy.',
        'Zadbaj o dobre światło. Przy świetle bocznym widać smugi, których nie zobaczysz przy lampie pod sufitem.',
        'Wietrz pomieszczenie, ale unikaj przeciągów i mocnego słońca na świeżej farbie.',
        'Taśmę malarską zdejmij po ostatniej warstwie, zanim farba całkiem wyschnie – krawędź będzie równa, a powłoka się nie oderwie.',
      ],
    },
    { firms: { service: 'malarz', locality: 'lodz' } },
  ],
}

const skimOrPlaster: SeedArticle = {
  slug: 'gladz-czy-tynk',
  title: 'Gładź czy tynk? Jak wybrać wykończenie ścian',
  excerpt:
    'Tynk wyrównuje ścianę, gładź wygładza jej powierzchnię. Wyjaśniamy, kiedy wystarczy sama gładź, kiedy potrzebny jest tynk i jak policzyć materiał.',
  category: 'wykonczenie-wnetrz',
  tags: ['gładź', 'tynk', 'ściany'],
  relatedServices: ['tynkarz', 'malarz', 'sucha-zabudowa'],
  daysAgo: 36,
  parts: [
    {
      p: 'Gładź i tynk często wrzuca się do jednego worka, a to dwie różne warstwy o innym zadaniu. Od tego, czego potrzebują Twoje ściany, zależy zakres prac, czas schnięcia i to, jakiej ekipy szukasz.',
    },
    { h2: 'Czym się różnią' },
    {
      p: '**Tynk** to warstwa wyrównująca mur. Kryje nierówności cegieł czy bloczków i wyprowadza ścianę do pionu. **Gładź** to cienka warstwa wykończeniowa. Wygładza powierzchnię pod malowanie, ale nie wyprostuje krzywej ściany – odwzoruje jej kształt.',
    },
    {
      table: {
        caption: 'Tynk i gładź w skrócie',
        header: ['Cecha', 'Tynk', 'Gładź'],
        rows: [
          ['Zadanie', 'wyrównanie muru, pion i płaszczyzna', 'gładka powierzchnia pod farbę'],
          ['Grubość', 'zwykle ok. 1–1,5 cm, miejscami więcej', 'zwykle 1–3 mm'],
          ['Rodzaje', 'gipsowy, cementowo-wapienny', 'gipsowa, polimerowa (gotowa)'],
          ['Podłoże', 'surowy mur, beton', 'tynk, beton, płyty g-k'],
          ['Kto wykonuje', 'tynkarz', 'tynkarz lub malarz'],
        ],
      },
    },
    { h2: 'Jak zdecydować' },
    {
      p: 'Zacznij od oceny ścian. Przyłóż do ściany długą, prostą łatę lub poziomicę i sprawdź, jak duże są szczeliny. Opukaj tynk – głuchy dźwięk oznacza, że odspoił się od muru. Sprawdź też narożniki, bo przy meblach na wymiar krzywizny widać najbardziej.',
    },
    { h3: 'Kiedy wystarczy gładź' },
    {
      ul: [
        'Ściany są w pionie, a tynk trzyma się mocno – po opukaniu nie słychać głuchego dźwięku.',
        'Na ścianach są drobne rysy, ślady po kołkach i niewielkie nierówności.',
        'Chcesz uzyskać bardzo gładką powierzchnię pod jasną, matową farbę.',
      ],
    },
    {
      p: 'Stare ściany trzeba przed gładzią przygotować: usunąć luźne fragmenty, zmyć farbę klejową, jeśli jest, i zagruntować podłoże. Gładź nakłada się zwykle w dwóch cienkich warstwach, a po wyschnięciu szlifuje i odpyla. Tynk gipsowy zatarty na gładko często nie wymaga gładzi i po zagruntowaniu można go malować.',
    },
    { h3: 'Kiedy potrzebny jest tynk' },
    {
      ul: [
        'Ściana jest z surowego muru albo stary tynk odpada płatami.',
        'Ściany są wyraźnie krzywe, a zależy Ci na prostych narożnikach, np. pod meble na wymiar.',
        'Po wymianie instalacji zostały szerokie bruzdy do uzupełnienia.',
        'Ściany idą pod płytki. Gładzi pod płytki się nie kładzie – podłoże wyrównuje się tynkiem lub płytami, a w strefie mokrej łazienki dodatkowo robi się hydroizolację.',
      ],
    },
    {
      p: 'Alternatywą dla tynku jest sucha zabudowa – płyty gipsowo-kartonowe przyklejone do ściany lub zamocowane na stelażu. Nie wnosisz do mieszkania wody, więc szybciej przejdziesz do malowania, ale stracisz trochę powierzchni pokoju.',
    },
    {
      p: 'Pamiętaj o schnięciu. Tynk to mokra praca i przed gładzią czy malowaniem musi wyschnąć. Dla tynku gipsowego przyjmuje się orientacyjnie ok. 1 mm grubości na dobę przy dobrej wentylacji i temperaturze, ale wiążący jest czas podany przez producenta.',
    },
    { h2: 'Ile gładzi kupić' },
    {
      p: 'Zużycie gładzi producent podaje na opakowaniu, zwykle w kilogramach na metr kwadratowy przy warstwie grubości 1 mm. Pomnóż je przez łączną grubość warstw i powierzchnię ścian, a potem dodaj zapas na straty przy mieszaniu i szlifowaniu.',
    },
    {
      p: 'Przykład: 40 m² ścian, dwie warstwy o łącznej grubości 2 mm. Jeśli producent podaje zużycie 1 kg na m² przy 1 mm, potrzeba ok. 80 kg gładzi, do tego niewielki zapas. Szybciej policzysz to w kalkulatorze.',
    },
    { calculator: 'skimCoat' },
    { h2: 'Najczęstsze pytania' },
    {
      faq: [
        {
          q: 'Gładź gipsowa czy polimerowa?',
          a: 'Gipsowa w worku jest zwykle tańsza i dobrze się szlifuje, ale trzeba ją rozrobić z wodą. Polimerowa jest gotowa do użycia i wygodna przy cienkich warstwach, ale zwykle droższa. Obie dają dobry efekt na przygotowanym podłożu.',
        },
        {
          q: 'Czy można malować bez gładzi?',
          a: 'Tak, jeśli tynk jest równy i gładki, np. gipsowy zatarty na gładko. Na tynku cementowo-wapiennym farba podkreśli jego fakturę.',
        },
        {
          q: 'Czy gładź można położyć na starą farbę?',
          a: 'Na nośną i dobrze związaną farbę – zwykle tak, po umyciu, zmatowieniu i zagruntowaniu. Farbę klejową i łuszczące się warstwy trzeba usunąć.',
        },
      ],
    },
    { firms: { service: 'tynkarz', locality: 'lodz' } },
  ],
}

const renovationOrder: SeedArticle = {
  slug: 'kolejnosc-prac-przy-remoncie-mieszkania',
  title: 'Kolejność prac przy remoncie mieszkania',
  excerpt:
    'Od planu i formalności, przez instalacje i mokre prace, po podłogi i malowanie. Kolejność, która oszczędza czas, pieniądze i nerwy.',
  category: 'wykonczenie-wnetrz',
  tags: ['remont mieszkania', 'planowanie', 'kolejność prac'],
  relatedServices: ['remont-mieszkania', 'elektryk', 'hydraulik', 'posadzki'],
  daysAgo: 21,
  parts: [
    {
      p: 'Przy remoncie mieszkania obowiązuje prosta zasada: najpierw to, co brudzi i co znika w ścianach, na końcu to, co ma ładnie wyglądać. Gdy kolejność się sypie, ekipy psują sobie nawzajem pracę, a Ty płacisz dwa razy.',
    },
    {
      quote:
        'Każdy etap powinien zostawić następnemu czyste i gotowe podłoże. Jeśli po malowaniu trzeba jeszcze kuć, to znaczy, że coś poszło w złej kolejności.',
    },
    { h2: 'Zanim zacznie się kucie' },
    {
      ul: [
        '**Plan i pomiar.** Spisz, co ma się zmienić w każdym pomieszczeniu: gdzie staną meble, gniazdka i punkty świetlne.',
        '**Budżet z rezerwą.** Po skuciu płytek czy zdjęciu podłogi często wychodzą rzeczy, których wcześniej nie widać, np. skorodowane rury albo krzywa wylewka. Zostaw na nie część budżetu.',
        '**Formalności.** Sprawdź regulamin spółdzielni lub wspólnoty: godziny głośnych prac, wywóz gruzu, korzystanie z windy. Zmiany w ścianach nośnych wymagają opinii konstruktora i formalności budowlanych.',
        '**Ekipy i terminy.** Ustal, kto wchodzi po kim. Przy kilku firmach harmonogram jest ważniejszy niż przy jednej – najbliższe wolne terminy firm porównasz w [wyszukiwarce](/szukaj).',
        '**Umowa.** Spisz zakres, terminy i płatności. Podpowiadamy, [co zapisać w umowie z ekipą](/artykuly/umowa-z-ekipa-remontowa).',
      ],
    },
    { h2: 'Kolejność prac' },
    {
      table: {
        caption: 'Typowa kolejność remontu mieszkania',
        header: ['Etap', 'Dlaczego w tym miejscu'],
        rows: [
          ['1. Demontaż, skuwanie, wywóz gruzu', 'odsłania stan ścian, podłóg i instalacji'],
          [
            '2. Ścianki działowe, zamurowania, stelaże zabudów',
            'wyznaczają, którędy pójdą instalacje',
          ],
          [
            '3. Instalacje: elektryka, woda, kanalizacja, ogrzewanie',
            'przed tynkami, żeby nie kuć gotowych ścian',
          ],
          ['4. Wymiana okien', 'przed tynkami, bo montaż niszczy ościeża'],
          ['5. Tynki i wylewki', 'najwięcej wody, potrzebują czasu na wyschnięcie'],
          [
            '6. Zamknięcie zabudów i sufitów z płyt g-k',
            'po odbiorze instalacji, które w nich biegną',
          ],
          ['7. Gładzie, szlifowanie, gruntowanie', 'przygotowanie ścian pod farbę'],
          ['8. Płytki w łazience i kuchni', 'na suche, nośne podłoże'],
          ['9. Malowanie', 'przed podłogami, żeby ich nie zachlapać'],
          ['10. Podłogi, drzwi wewnętrzne, listwy', 'na wykończone ściany i suche wylewki'],
          ['11. Biały montaż, gniazdka, poprawki malarskie', 'na końcu, gdy kurz już opadł'],
        ],
      },
    },
    {
      p: 'Szczegóły mogą się różnić. Ościeżnice regulowane montuje się zwykle po podłogach, a sufit podwieszany bywa zamykany przed gładziami na ścianach. Ważne, żeby ekipy ustaliły kolejność między sobą przed startem, a nie w dniu wejścia na budowę.',
    },
    { h3: 'Remont w mieszkaniu, w którym mieszkasz' },
    {
      p: 'Jeśli nie możesz się wyprowadzić, remontuj pomieszczenie po pomieszczeniu, ale instalacje zaplanuj dla całego mieszkania naraz. Nowa rozdzielnica i nowe przewody od pionu do łazienki to praca, której nie warto robić dwa razy. Na czas prac w łazience ustal z ekipą, jak długo będziesz bez działającego WC i prysznica.',
    },
    { h2: 'Mokre prace i czas schnięcia' },
    {
      p: 'Najczęstszy błąd to pośpiech po tynkach i wylewkach. Wylewka cementowa schnie orientacyjnie ok. 1 cm grubości na tydzień w dobrych warunkach, a przy grubszej warstwie i w chłodzie dłużej. Panele i deski kładzie się dopiero wtedy, gdy wilgotność podłoża spadnie do poziomu podanego przez producenta podłogi. Ekipa powinna ją zmierzyć, a nie oceniać na oko.',
    },
    {
      ul: [
        'Wietrz mieszkanie, ale nie przyspieszaj schnięcia nagrzewnicami – zbyt szybkie suszenie grozi pęknięciami.',
        'Zimą zadbaj o ogrzewanie, bo w zimnym mieszkaniu tynki i wylewki schną znacznie wolniej.',
        'Wykorzystaj ten czas na zamówienie drzwi, mebli i wyposażenia.',
      ],
    },
    { h2: 'Zanim zamkniesz ściany' },
    {
      p: 'Przed tynkami i zabudowami zrób odbiór instalacji. Sprawdź, czy wszystkie punkty są tam, gdzie miały być, i poproś o próbę szczelności instalacji wodnej. Zrób zdjęcia każdej ściany z miarką w kadrze – po latach przydadzą się przy wierceniu i naprawach. Od elektryka odbierz protokół z pomiarów instalacji.',
    },
    {
      ol: [
        'Porównaj rozmieszczenie gniazdek, punktów świetlnych i podejść wodnych z planem.',
        'Sprawdź, czy rury i przewody nie biegną tam, gdzie planujesz wieszać szafki lub telewizor.',
        'Odnotuj w protokole odbioru częściowego wszystko, co trzeba poprawić, zanim ekipa przejdzie dalej.',
      ],
    },
    { firms: { service: 'remont-mieszkania', locality: 'lodz' } },
  ],
}

const oldBlockWiring: SeedArticle = {
  slug: 'instalacja-elektryczna-w-starym-bloku',
  title: 'Instalacja elektryczna w starym bloku: kiedy wymienić i jak to zaplanować',
  excerpt:
    'Aluminiowe przewody, gniazdka bez bolca i bezpieczniki topikowe to znak, że instalacja nie nadąża za współczesnym mieszkaniem. Co sprawdzić i jak zaplanować wymianę.',
  category: 'instalacje',
  tags: ['elektryka', 'blok', 'instalacje'],
  relatedServices: ['elektryk', 'remont-mieszkania'],
  daysAgo: 44,
  parts: [
    {
      p: 'W wielu blokach z lat 60., 70. i 80. instalacja elektryczna w mieszkaniach pamięta czasy budowy. Projektowano ją na lodówkę, telewizor i żelazko, a nie na płytę indukcyjną, zmywarkę, klimatyzator i kilka ładowarek naraz. Remont to najlepszy moment na wymianę, bo przewody i tak chowa się w ścianach przed tynkami.',
    },
    { h2: 'Sygnały, że instalacja wymaga wymiany' },
    {
      ul: [
        'Przewody aluminiowe – widać je po srebrnym kolorze żył w puszkach i gniazdkach.',
        'Gniazdka bez bolca ochronnego i instalacja dwużyłowa, bez osobnego przewodu ochronnego.',
        'Bezpieczniki topikowe, tzw. korki, zamiast wyłączników nadprądowych.',
        'Brak wyłącznika różnicowoprądowego.',
        'Kilka pokoi na jednym obwodzie i zabezpieczenia, które wyłączają się po włączeniu czajnika i pralki naraz.',
        'Nagrzewające się gniazdka, zapach spalenizny, ciemne ślady na osprzęcie – to powód do pilnej wizyty elektryka.',
      ],
    },
    {
      table: {
        caption: 'Stara i nowa instalacja w mieszkaniu',
        header: ['Element', 'Często w starym bloku', 'Po wymianie'],
        rows: [
          ['Przewody', 'aluminiowe, dwużyłowe', 'miedziane, z przewodem ochronnym'],
          ['Zabezpieczenia', 'bezpieczniki topikowe', 'wyłączniki nadprądowe i różnicowoprądowe'],
          [
            'Obwody',
            'kilka wspólnych dla całego mieszkania',
            'osobne dla oświetlenia, gniazd, kuchni, łazienki i dużych urządzeń',
          ],
          ['Gniazdka', 'bez bolca ochronnego, mało punktów', 'z bolcem, rozmieszczone pod meble'],
          ['Dokumentacja', 'zwykle brak', 'schemat rozdzielnicy i protokół pomiarów'],
        ],
      },
    },
    { h2: 'Na co uważać w bloku' },
    {
      p: 'Mieszkanie to tylko część instalacji. Wewnętrzna linia zasilająca, pion i licznik należą do części wspólnej budynku albo do operatora sieci, więc nie zmienia się ich na własną rękę.',
    },
    {
      ul: [
        '**Przewód ochronny.** Jeśli instalacja w budynku jest dwuprzewodowa, sposób wykonania ochrony w mieszkaniu ustala elektryk z uprawnieniami, w razie potrzeby razem z zarządcą budynku.',
        '**Moc przyłączeniowa.** Płyta indukcyjna czy klimatyzacja mogą wymagać większej mocy niż przydzielona mieszkaniu. O jej zwiększenie wnioskuje się u operatora sieci.',
        '**Bruzdy.** W budynkach z wielkiej płyty kucie głębokich bruzd w ścianach nośnych jest ryzykowne, a regulaminy spółdzielni często tego zabraniają. Przewody prowadzi się wtedy w podłodze, w suficie podwieszanym albo płytko pod tynkiem.',
        '**Łączenie z aluminium.** Jeśli część starej instalacji zostaje, połączenia miedzi z aluminium wykonuje się wyłącznie złączkami do tego przeznaczonymi.',
        '**Łazienka.** Gniazdka montuje się poza strefami ochronnymi wokół wanny i prysznica, na obwodzie z wyłącznikiem różnicowoprądowym 30 mA.',
      ],
    },
    { h2: 'Jak zaplanować wymianę' },
    {
      ol: [
        'Spisz urządzenia, które planujesz, i zaznacz gniazdka w każdym pomieszczeniu – najlepiej na rzucie z ustawieniem mebli.',
        'Umów elektryka na oględziny rozdzielnicy, pionu i licznika, zanim ekipa zacznie skuwać ściany.',
        'Wymianę zaplanuj po pracach rozbiórkowych, a przed tynkami i gładziami.',
        'Przed zamknięciem bruzd zrób zdjęcia przebiegu przewodów z miarką w kadrze.',
        'Po zakończeniu prac elektryk z uprawnieniami wykonuje pomiary i wydaje protokół. Zachowaj go razem ze schematem rozdzielnicy.',
      ],
    },
    {
      p: 'Rozdzielnicę zaplanuj z zapasem wolnych miejsc na przyszłe obwody, np. dla ładowarki, klimatyzacji czy ogrzewania podłogowego w łazience. Przekroje przewodów i zabezpieczenia dobiera elektryk do obciążenia każdego obwodu.',
    },
    {
      p: 'Prosząc o wycenę, podaj liczbę pomieszczeń, gniazdek i punktów świetlnych oraz listę dużych urządzeń. Dopytaj, czy cena obejmuje bruzdy i ich uzupełnienie, nową rozdzielnicę, osprzęt i pomiary końcowe. Dwie wyceny „za wymianę elektryki” bez tych szczegółów trudno porównać.',
    },
    { h2: 'Najczęstsze pytania' },
    {
      faq: [
        {
          q: 'Czy wymianę instalacji trzeba zgłaszać?',
          a: 'Wymiana instalacji wewnątrz mieszkania zwykle nie wymaga pozwolenia na budowę. Sprawdź jednak regulamin spółdzielni lub wspólnoty i uzgodnij z zarządcą wszystko, co dotyczy pionu, licznika i części wspólnych.',
        },
        {
          q: 'Czy da się wymienić instalację bez kucia?',
          a: 'Częściowo tak: przewody można poprowadzić w listwach, w suficie podwieszanym albo w podłodze. Każde rozwiązanie ma ograniczenia, dlatego omów je z elektrykiem przed remontem.',
        },
        {
          q: 'Czy wystarczy wymienić same gniazdka?',
          a: 'Nowe gniazdka z bolcem nic nie dadzą, jeśli nie ma do nich doprowadzonego przewodu ochronnego. Bez nowych przewodów i zabezpieczeń zmienia się tylko wygląd.',
        },
      ],
    },
    { firms: { service: 'elektryk', locality: 'lodz' } },
  ],
}

const contract: SeedArticle = {
  slug: 'umowa-z-ekipa-remontowa',
  title: 'Umowa z ekipą remontową: co w niej zapisać',
  excerpt:
    'Zakres prac, terminy, wynagrodzenie, odbiór i odpowiedzialność za wady. Punkty, które warto mieć na piśmie, zanim ekipa wejdzie do mieszkania.',
  category: 'koszty-i-umowy',
  tags: ['umowa', 'formalności', 'odbiór prac'],
  relatedServices: ['remont-mieszkania'],
  daysAgo: 28,
  parts: [
    {
      p: 'Umowa ustna na remont jest ważna, ale w razie sporu trudno udowodnić, co dokładnie ustalono. Pisemna umowa nie musi być długa. Ma jasno odpowiadać na pytania: co, za ile, do kiedy i co się dzieje, gdy coś pójdzie nie tak.',
    },
    { h2: 'Jaka to umowa' },
    {
      p: 'Remont mieszkania najczęściej zawiera się jako **umowę o dzieło**: wykonawca zobowiązuje się do określonego rezultatu, np. wyremontowanej łazienki, a Ty do zapłaty wynagrodzenia. Przy większych pracach prowadzonych według projektu może to być umowa o roboty budowlane, z nieco innymi zasadami. O rodzaju umowy decyduje jej treść, nie tytuł. Przy dużej inwestycji pokaż projekt umowy prawnikowi.',
    },
    { h2: 'Co powinno znaleźć się w umowie' },
    {
      ul: [
        '**Strony.** Pełna nazwa firmy, adres i NIP. Dane sprawdzisz w CEIDG lub KRS.',
        '**Zakres prac.** Lista prac z ilościami, najlepiej z kosztorysem jako załącznikiem. Ogólne „remont łazienki” to za mało.',
        '**Materiały.** Kto je kupuje, w jakim standardzie i jak są rozliczane – w cenie czy osobno, według faktur.',
        '**Wynagrodzenie.** Ryczałtowe, czyli stała kwota za cały zakres, albo kosztorysowe, według faktycznie wykonanych ilości. Przy ryczałcie łatwiej zaplanować budżet, przy kosztorysie końcowa kwota może się zmienić.',
        '**Prace dodatkowe.** Zapis, że wymagają Twojej zgody na piśmie i wyceny przed wykonaniem.',
        '**Terminy.** Data rozpoczęcia, zakończenia i najważniejszych etapów.',
        '**Kary umowne.** Np. określona kwota za każdy dzień zwłoki.',
        '**Płatności.** Harmonogram powiązany z etapami. Więcej w artykule o [zaliczce, zadatku i etapach płatności](/artykuly/zaliczka-zadatek-etapy-platnosci).',
        '**Porządek.** Kto wywozi gruz i sprząta, w jakich godzinach trwają prace, jak przekazywane są klucze.',
        '**Podwykonawcy.** Czy firma może ich zatrudnić. Wykonawca odpowiada za osoby, którymi się posługuje, jak za własne działania.',
        '**Ubezpieczenie.** Zapytaj, czy firma ma ubezpieczenie OC działalności. Przyda się, gdy ekipa np. zaleje mieszkanie sąsiada.',
        '**Dokumenty po pracach.** Protokoły pomiarów i prób, karty gwarancyjne urządzeń, informacje o użytych materiałach.',
      ],
    },
    {
      p: 'Do umowy dołącz rzut mieszkania z zaznaczonymi pracami i wybranymi materiałami. Rysunek rozwiewa więcej wątpliwości niż najdłuższy opis.',
    },
    { h2: 'Odbiór i odpowiedzialność za wady' },
    {
      p: 'Zapisz, jak wygląda odbiór. Przy remoncie warto robić **odbiory częściowe**, np. instalacji przed zakryciem tynkiem, i **odbiór końcowy** z protokołem. W protokole odbioru wpisuje się stwierdzone usterki, termin ich usunięcia i podpisy obu stron. Podpis pod protokołem bez uwag utrudnia późniejsze reklamowanie wad, które było widać już przy odbiorze.',
    },
    {
      p: 'Za wady wykonanej pracy wykonawca odpowiada z tytułu **rękojmi** – z mocy prawa, nawet gdy umowa o tym milczy. **Gwarancja** to dodatkowe, dobrowolne zobowiązanie: jeśli firma ją daje, zapisz w umowie jej okres i zakres. Uważaj na zapisy ograniczające odpowiedzialność za wady. W razie wątpliwości zapytaj miejskiego lub powiatowego rzecznika konsumentów.',
    },
    { h2: 'Umowa podpisana w domu' },
    {
      p: 'Jeśli jako konsument podpisujesz umowę z firmą poza jej siedzibą, np. u siebie w mieszkaniu, co do zasady masz 14 dni na odstąpienie od niej bez podawania przyczyny. Gdy chcesz, żeby prace ruszyły wcześniej, firma powinna uzyskać Twoje wyraźne żądanie. Jeśli potem odstąpisz od umowy, zapłacisz za to, co zostało już zrobione.',
    },
    {
      faq: [
        {
          q: 'Czy wystarczą ustalenia w e-mailach?',
          a: 'Wiadomości też są dowodem, ale łatwo w nich o niejasności. Lepiej zebrać wszystko w jednym dokumencie z załącznikami i podpisać go odręcznie lub podpisem elektronicznym.',
        },
        {
          q: 'Co zrobić, gdy firma nie dotrzymuje terminu?',
          a: 'Wezwij ją na piśmie do wykonania prac w wyznaczonym terminie. Jeśli w umowie są kary umowne, możesz ich żądać. Przy dużym opóźnieniu przepisy w określonych sytuacjach pozwalają odstąpić od umowy – kolejne kroki warto wtedy omówić z prawnikiem.',
        },
        {
          q: 'Kto jest stroną umowy, jeśli firmę znalazłem w serwisie?',
          a: 'Ty i firma. Ekipa na Termin pomaga znaleźć wykonawcę, ale nie jest stroną umowy i nie odpowiada za prace ani rozliczenia.',
        },
      ],
    },
    { firms: { service: 'remont-mieszkania', locality: 'lodz' } },
  ],
}

const payments: SeedArticle = {
  slug: 'zaliczka-zadatek-etapy-platnosci',
  title: 'Zaliczka czy zadatek? Jak bezpiecznie płacić za remont',
  excerpt:
    'Zaliczka i zadatek to nie to samo – różnica wychodzi, gdy umowa nie zostanie wykonana. Wyjaśniamy zasady i podpowiadamy, jak podzielić płatności na etapy.',
  category: 'koszty-i-umowy',
  tags: ['zaliczka', 'zadatek', 'płatności', 'umowa'],
  relatedServices: ['remont-mieszkania'],
  daysAgo: 67,
  parts: [
    {
      p: 'Wiele firm remontowych prosi o wpłatę przed rozpoczęciem prac. To normalne, zwłaszcza gdy ekipa zamawia materiały albo rezerwuje dla Ciebie termin. Ważne jest jednak, jak ta kwota zostanie nazwana w umowie, bo zaliczka i zadatek działają inaczej, gdy coś pójdzie nie tak.',
    },
    { h2: 'Zaliczka' },
    {
      p: 'Zaliczka to część wynagrodzenia zapłacona z góry. Gdy umowa zostanie wykonana, zalicza się ją na poczet ceny. Gdy nie zostanie wykonana, co do zasady podlega zwrotowi, niezależnie od tego, kto zawinił. Strona, która poniosła szkodę, może dochodzić odszkodowania na zasadach ogólnych, ale musi wykazać jej wysokość.',
    },
    { h2: 'Zadatek' },
    {
      p: 'Zadatek reguluje art. 394 Kodeksu cywilnego. Daje się go przy zawarciu umowy i działa jak zabezpieczenie dla obu stron:',
    },
    {
      ul: [
        'gdy umowa zostanie wykonana, zadatek zalicza się na poczet wynagrodzenia;',
        'gdy umowy nie wykona firma, możesz bez wyznaczania dodatkowego terminu odstąpić od umowy i żądać sumy dwukrotnie wyższej niż zadatek;',
        'gdy umowy nie wykonasz Ty, firma może odstąpić od umowy i zatrzymać zadatek;',
        'gdy umowę rozwiążecie albo nie zostanie wykonana z przyczyn, za które nie odpowiada żadna ze stron lub odpowiadają obie, zadatek się zwraca.',
      ],
    },
    {
      p: 'Przykład: wpłacasz 3000 zł zadatku, a firma bez uzasadnienia nie przystępuje do prac. Możesz odstąpić od umowy i żądać 6000 zł. Jeśli to Ty zrezygnujesz bez winy firmy, może ona zatrzymać 3000 zł.',
    },
    {
      p: 'Jeśli w umowie nie pada słowo „zadatek”, wpłata jest zwykle traktowana jak zaliczka. Dlatego zawsze zapisz wprost, czym jest pierwsza wpłata.',
    },
    {
      table: {
        caption: 'Zaliczka i zadatek – co się dzieje z wpłatą',
        header: ['Sytuacja', 'Zaliczka', 'Zadatek'],
        rows: [
          ['Umowa wykonana', 'zaliczona na poczet ceny', 'zaliczony na poczet ceny'],
          [
            'Nie wykonuje firma',
            'zwrot zaliczki, ewentualnie odszkodowanie',
            'możesz odstąpić i żądać dwukrotności zadatku',
          ],
          [
            'Nie wykonuje klient',
            'zwrot zaliczki, firma może żądać odszkodowania',
            'firma może odstąpić i zatrzymać zadatek',
          ],
          ['Rozwiązanie umowy za porozumieniem', 'zwrot zaliczki', 'zwrot zadatku'],
        ],
      },
    },
    { h2: 'Płatności etapami' },
    {
      p: 'Bezpieczny harmonogram to taki, w którym płacisz za wykonaną i odebraną pracę, a nie za obietnicę. Wysokość wpłat ustalają strony – przepisy nie określają, ile może wynosić zaliczka czy zadatek.',
    },
    {
      ul: [
        'Pierwsza wpłata powinna odpowiadać realnym kosztom startu, np. zamówionym materiałom. Jeśli firma chce pieniędzy na materiały, poproś o faktury albo kup je sam.',
        'Kolejne raty powiąż z etapami opisanymi w umowie, np. po instalacjach, po płytkach, po malowaniu – każdą po odbiorze częściowym.',
        'Ostatnią część wynagrodzenia zostaw do odbioru końcowego i usunięcia usterek wpisanych do protokołu.',
        'Płać przelewem na rachunek firmy i zachowuj potwierdzenia. Rachunek firmy, która jest czynnym podatnikiem VAT, sprawdzisz na tzw. białej liście podatników VAT.',
        'Za każdą płatność bierz fakturę lub rachunek.',
      ],
    },
    { h3: 'Sygnały ostrzegawcze' },
    {
      ul: [
        'Żądanie zapłaty całości lub większości kwoty przed rozpoczęciem prac.',
        'Brak umowy albo odmowa zapisania, czy wpłata jest zaliczką, czy zadatkiem.',
        'Płatność wyłącznie gotówką, bez żadnego potwierdzenia.',
      ],
    },
    {
      p: 'Pamiętaj, że harmonogram płatności to część umowy. Sprawdź, [co jeszcze w niej zapisać](/artykuly/umowa-z-ekipa-remontowa).',
    },
    { h2: 'Najczęstsze pytania' },
    {
      faq: [
        {
          q: 'Czy mogę odzyskać zadatek, jeśli rezygnuję z remontu?',
          a: 'Jeśli rezygnujesz bez winy firmy, firma może zadatek zatrzymać. Gdy rozwiążecie umowę za porozumieniem, zadatek się zwraca – takie porozumienie spiszcie.',
        },
        {
          q: 'Czy zaliczkę można dać w gotówce?',
          a: 'Można, ale weź pisemne pokwitowanie z datą, kwotą, podpisem i informacją, czy to zaliczka, czy zadatek. Przelew zostawia ślad bez dodatkowych dokumentów.',
        },
        {
          q: 'Co zrobić, gdy firma wzięła zaliczkę i nie zaczęła prac?',
          a: 'Wyślij pisemne wezwanie do rozpoczęcia prac albo zwrotu pieniędzy z konkretnym terminem. Jeśli to nie pomoże, możesz skorzystać z pomocy rzecznika konsumentów lub dochodzić zwrotu w sądzie. Gdy podejrzewasz oszustwo, zgłoś sprawę na policję.',
        },
      ],
    },
    { firms: { service: 'remont-mieszkania', locality: 'lodz' } },
  ],
}

const insulation: SeedArticle = {
  slug: 'docieplenie-domu',
  title: 'Docieplenie domu: materiały, formalności i najczęstsze błędy',
  excerpt:
    'Styropian czy wełna, jak dobrać grubość i kiedy prowadzić prace. Co warto wiedzieć, zanim zamówisz ocieplenie ścian domu jednorodzinnego.',
  category: 'dom-i-elewacja',
  tags: ['docieplenie', 'elewacja', 'dom'],
  relatedServices: ['elewacje', 'okna-i-drzwi', 'dekarz'],
  daysAgo: 82,
  parts: [
    {
      p: 'Docieplenie ścian zmniejsza straty ciepła, poprawia komfort i odświeża wygląd domu. To praca na lata, w której błędy wychodzą dopiero zimą – jako zawilgocenia, rysy na tynku czy przemarzające narożniki. Dobre przygotowanie zaczyna się od pytania, czy ściany to w ogóle pierwszy krok.',
    },
    { h2: 'Od czego zacząć' },
    {
      ul: [
        '**Sprawdź, gdzie dom traci ciepło.** Dach lub strop pod nieogrzewanym poddaszem, okna, ściany, podłoga na gruncie – audyt energetyczny albo badanie kamerą termowizyjną pokaże, od czego zacząć.',
        '**Okna przed ociepleniem.** Jeśli planujesz wymianę okien, zrób ją wcześniej. Ocieplenie zachodzi na ościeża, a wymiana okien po elewacji oznacza poprawki.',
        '**Formalności.** Docieplenie domu jednorodzinnego zwykle wymaga zgłoszenia w starostwie lub w urzędzie miasta na prawach powiatu, a nie pozwolenia na budowę. Budynek w strefie ochrony konserwatorskiej może wymagać dodatkowych uzgodnień.',
        '**Dofinansowanie.** Sprawdź aktualne programy dopłat, np. „Czyste Powietrze”, i ulgę termomodernizacyjną w PIT. Ich warunki się zmieniają i mogą dotyczyć terminów, dokumentów oraz wykonawcy, dlatego zapoznaj się z nimi przed podpisaniem umowy.',
      ],
    },
    { h2: 'Styropian czy wełna mineralna' },
    {
      p: 'Ściany najczęściej ociepla się metodą lekką mokrą (ETICS): płyty izolacji przykleja się do muru, w razie potrzeby mocuje kołkami, pokrywa klejem z zatopioną siatką i tynkiem cienkowarstwowym. Wszystkie warstwy powinny pochodzić z jednego systemu producenta.',
    },
    {
      table: {
        caption: 'Styropian i wełna mineralna w ociepleniu ścian',
        header: ['Cecha', 'Styropian (EPS)', 'Wełna mineralna'],
        rows: [
          ['Reakcja na ogień', 'materiał palny', 'niepalna'],
          ['Paroprzepuszczalność', 'niska', 'wysoka'],
          ['Waga i montaż', 'lekki, łatwy w obróbce', 'cięższa, zwykle mocowana także kołkami'],
          ['Cena materiału', 'zwykle niższa', 'zwykle wyższa'],
          [
            'Kiedy rozważyć',
            'większość domów murowanych',
            'ściany o konstrukcji drewnianej, wyższe wymagania pożarowe',
          ],
        ],
      },
    },
    {
      p: 'Grubość izolacji dobiera się obliczeniowo. Punktem odniesienia są warunki techniczne, które dla ścian zewnętrznych wymagają współczynnika przenikania ciepła U nie większego niż 0,20 W/(m²·K). Ile to centymetrów, zależy od muru i od współczynnika lambda płyt podanego przez producenta. Im niższa lambda, tym cieńsza warstwa wystarczy.',
    },
    { h2: 'Wykonanie: błędy i pogoda' },
    { h3: 'Najczęstsze błędy' },
    {
      ul: [
        'Klej nałożony tylko w kilku plackach. Przy styropianie stosuje się obwodowy pas kleju i placki na środku płyty, żeby pod izolacją nie krążyło powietrze.',
        'Szczeliny między płytami wypełnione klejem zamiast pianką lub paskami izolacji – powstają w tych miejscach mostki termiczne.',
        'Siatka bez zakładów lub z za małymi zakładami (zwykle co najmniej 10 cm) i brak dodatkowych pasów siatki w narożnikach okien i drzwi. Tam najłatwiej o rysy.',
        'Styropian grafitowy zostawiony w pełnym słońcu bez osłony – nagrzewa się i odkształca.',
        'Nieocieplone ościeża, nadproża i cokół. Strefę przy gruncie ociepla się materiałem odpornym na wilgoć, np. polistyrenem ekstrudowanym (XPS).',
        'Stare parapety zewnętrzne i obróbki blacharskie, które po dociepleniu są za krótkie.',
      ],
    },
    { h3: 'Kiedy prowadzić prace' },
    {
      p: 'Dopuszczalne warunki podaje producent systemu. Zwykle nie pracuje się poniżej +5°C, w deszczu, przy silnym wietrze ani przy tynkowaniu w pełnym słońcu. Najlepszy czas to późna wiosna, lato bez upałów i wczesna jesień. Na ten sezon ekipy elewacyjne planują prace z wyprzedzeniem, więc termin warto ustalić wcześniej – w [wyszukiwarce](/szukaj) sprawdzisz najbliższe wolne terminy firm.',
    },
    { h2: 'Najczęstsze pytania' },
    {
      faq: [
        {
          q: 'Czy można docieplać dom zimą?',
          a: 'Prace na mokro wymagają warunków podanych przez producenta systemu, także w czasie wiązania kleju i tynku. Przy mrozie i dużej wilgotności ich się nie prowadzi, a ryzyko złego związania materiałów rośnie.',
        },
        {
          q: 'Czy przed dociepleniem trzeba skuć stary tynk?',
          a: 'Nie zawsze. Podłoże musi być nośne, czyste i suche. Odspojone fragmenty się usuwa, a przyczepność sprawdza się na próbnych przyklejeniach izolacji.',
        },
        {
          q: 'Czy docieplenie rozwiąże problem zawilgoconych ścian?',
          a: 'Nie. Najpierw trzeba usunąć przyczynę wilgoci, np. uszkodzoną izolację fundamentów czy nieszczelne rynny, i osuszyć mur. Ocieplenie położone na mokrą ścianę może problem pogłębić.',
        },
      ],
    },
    { firms: { service: 'elewacje', locality: 'lodz' } },
  ],
}

export const SEED_ARTICLES: SeedArticle[] = [
  bathShower,
  paintPrep,
  kitchenOrder,
  renovationOrder,
  contract,
  skimOrPlaster,
  oldBlockWiring,
  largeTiles,
  payments,
  insulation,
]
