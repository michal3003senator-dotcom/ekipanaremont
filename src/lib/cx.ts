/** Łączy klasy CSS, pomijając puste wartości. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
