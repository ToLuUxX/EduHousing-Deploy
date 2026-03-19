'use client'

import { type ReactNode } from 'react'
import { useSearch } from '../core/SearchContext'
import type { Hit } from '../core/types'

// ---------------------------------------------------------------------------
// Hits
// ---------------------------------------------------------------------------
interface HitsProps<T extends Hit> {
  renderHit: (hit: T) => ReactNode
  emptyMessage?: string
}

export function Hits<T extends Hit>({
  renderHit,
  emptyMessage = 'Aucun résultat.',
}: HitsProps<T>) {
  const { results, loading } = useSearch()

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', height: 180, animation: 'pulse 1.2s ease-in-out infinite', opacity: 0.6 }} />
        ))}
      </div>
    )
  }

  if (!results.hits.length) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)', fontSize: 15 }}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {results.hits.map((hit) => renderHit(hit as T))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SortBy
// ---------------------------------------------------------------------------
export function SortBy({ className }: { className?: string }) {
  const { config, sortKey, handleSort } = useSearch()
  const options = config.sortOptions ?? []
  if (options.length <= 1) return null

  return (
    <select
      value={sortKey}
      onChange={(e) => handleSort(e.target.value)}
      className={className}
      aria-label="Trier par"
      style={{
        padding: '9px 14px',
        fontSize: 14,
        fontFamily: 'inherit',
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 10,
        color: 'var(--text)',
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      {options.map((opt) => (
        <option key={opt.key} value={opt.key}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
export function Stats({ className }: { className?: string }) {
  const { results, loading } = useSearch()

  return (
    <p
      className={className}
      aria-live="polite"
      style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}
    >
      {loading ? '…' : `${results.total} résultat${results.total !== 1 ? 's' : ''}`}
    </p>
  )
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export function Pagination({ className }: { className?: string }) {
  const { results, page, setPage } = useSearch()
  const { nbPages } = results

  if (nbPages <= 1) return null

  return (
    <nav
      className={className}
      aria-label="Pagination"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}
    >
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 0}
        aria-label="Page précédente"
        style={{
          padding: '8px 14px',
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 9,
          fontSize: 14,
          cursor: page === 0 ? 'not-allowed' : 'pointer',
          opacity: page === 0 ? 0.4 : 1,
          fontFamily: 'inherit',
        }}
      >
        ←
      </button>

      {Array.from({ length: nbPages }).map((_, i) => {
        const near = Math.abs(i - page) <= 1 || i === 0 || i === nbPages - 1
        if (!near && (i === 1 || i === nbPages - 2)) {
          return <span key={i} style={{ color: 'var(--text-muted)' }}>…</span>
        }
        if (!near) return null
        const active = i === page
        return (
          <button
            key={i}
            onClick={() => setPage(i)}
            aria-current={active ? 'page' : undefined}
            style={{
              padding: '8px 13px',
              borderRadius: 9,
              border: active ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
              background: active ? 'var(--accent)' : 'var(--surface)',
              color: active ? '#fff' : 'var(--text)',
              fontSize: 14,
              fontWeight: active ? 700 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {i + 1}
          </button>
        )
      })}

      <button
        onClick={() => setPage(page + 1)}
        disabled={page >= nbPages - 1}
        aria-label="Page suivante"
        style={{
          padding: '8px 14px',
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 9,
          fontSize: 14,
          cursor: page >= nbPages - 1 ? 'not-allowed' : 'pointer',
          opacity: page >= nbPages - 1 ? 0.4 : 1,
          fontFamily: 'inherit',
        }}
      >
        →
      </button>
    </nav>
  )
}
