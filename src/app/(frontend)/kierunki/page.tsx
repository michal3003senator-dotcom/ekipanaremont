import Link from 'next/link'

export default function DirectionsPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-page flex-col justify-center gap-6 px-4 md:px-6">
      <h1 className="font-display text-h1 font-medium">Dwa kierunki do wyboru</h1>
      <ul className="flex flex-col gap-3 text-lead">
        <li>
          <Link href="/kierunki/tynk" className="text-accent-soft underline underline-offset-4">
            1. Tynk i fuga
          </Link>{' '}
          – jasna ściana, siatka z płytek, kolor tylko na wolnym dniu
        </li>
        <li>
          <Link href="/kierunki/budowa" className="text-accent-soft underline underline-offset-4">
            2. Kartka z budowy
          </Link>{' '}
          – beton, grafik ekipy jak na budowie, żółty sygnałowy
        </li>
      </ul>
    </main>
  )
}
