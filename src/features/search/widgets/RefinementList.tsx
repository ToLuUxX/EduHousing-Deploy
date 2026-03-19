'use client'

import { useSearch } from '../core/SearchContext'

interface RefinementListProps {
  facetKey: string
  label: string
  className?: string
}

export function RefinementList({ facetKey, label, className }: RefinementListProps) {
  const { results, filters, toggleFilter } = useSearch()
  const facetData = results.facets[facetKey] ?? {}
  const selected = filters[facetKey] ?? []
  const entries = Object.entries(facetData).sort((a, b) => b[1] - a[1])

  if (!entries.length) return null

  return (
    <div className={className} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
      <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>{label}</p>
      {entries.map(([value, count]) => {
        const active = selected.includes(value)
        return (
          <label key={value} onClick={() => toggleFilter(facetKey, value)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', fontSize: 14 }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`, background: active ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.12s' }}>
              {active && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
            </span>
            <span style={{ flex: 1, color: active ? 'var(--accent)' : 'var(--text)', fontWeight: active ? 600 : 400 }}>{value}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', padding: '1px 7px', borderRadius: 99 }}>{count}</span>
          </label>
        )
      })}
    </div>
  )
}