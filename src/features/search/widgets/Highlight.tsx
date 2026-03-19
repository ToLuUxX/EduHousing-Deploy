interface HighlightProps {
  text: string | number | undefined | null
  query: string
}

export function Highlight({ text, query }: HighlightProps) {
  if (!text) return null
  const str = String(text)
  if (!query.trim()) return <span>{str}</span>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = str.split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} style={{ background: '#FFE066', color: '#1a1a1a', borderRadius: 2, padding: '0 1px' }}>
            {part}
          </mark>
        ) : part
      )}
    </span>
  )
}