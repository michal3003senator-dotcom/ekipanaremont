type Row = { id?: string | null; cells?: readonly string[] | null }

/** Tabela: podpis dla czytników ekranu i oka, przewijana w poziomie na telefonie. */
export function TableBlock({
  caption,
  header,
  rows,
}: {
  caption: string
  header?: readonly string[] | null
  rows?: readonly Row[] | null
}) {
  return (
    <div className="overflow-x-auto rounded-card border border-line">
      <table className="w-full border-collapse text-small">
        <caption className="px-4 pt-3 pb-2 text-start text-text-muted">{caption}</caption>
        {header && header.length > 0 && (
          <thead>
            <tr className="border-y border-line bg-surface-2">
              {header.map((cell, index) => (
                <th key={index} scope="col" className="px-4 py-3 text-start font-medium">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {(rows ?? []).map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex} className="border-b border-line last:border-b-0">
              {(row.cells ?? []).map((cell, index) => (
                <td key={index} className="px-4 py-3 align-top font-data">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
