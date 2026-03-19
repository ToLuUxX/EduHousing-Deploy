import React from 'react'
import { Highlight } from '../widgets/Highlight'
import { useSearch } from '../core/SearchContext'
import type { Hit } from '../core/types'

interface ListingCardProps {
  hit: Hit
}

export function ListingCard({ hit }: ListingCardProps) {
  const { query } = useSearch()
  const image = Array.isArray(hit.images) ? (hit.images[0] as string) : undefined

  return (
    <article
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: `0 2px 8px var(--shadow)`,
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.boxShadow = `0 6px 20px var(--shadow)`
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.boxShadow = `0 2px 8px var(--shadow)`
        el.style.transform = 'none'
      }}
    >
      {image && (
        <div style={{ height: 160, overflow: 'hidden', background: 'var(--bg)' }}>
          <img
            src={image}
            alt={String(hit.title ?? '')}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {hit.type != null && (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            color: 'var(--accent)',
            background: 'var(--accent-alpha)',
            padding: '2px 8px',
            borderRadius: 99,
            alignSelf: 'flex-start',
          }}>
            {String(hit.type ?? '')}
          </span>
        )}
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
          <Highlight text={String(hit.title ?? '')} query={query} />
        </h3>
        {hit.location != null && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>📍</span>
            <Highlight text={String(hit.location)} query={query} />
          </p>
        )}
        {hit.description != null && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
            <Highlight text={String(hit.description)} query={query} />
          </p>
        )}
        {hit.price != null && (
          <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>
            {Number(hit.price).toLocaleString('fr-FR')} €
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>/mois</span>
          </p>
        )}
      </div>
    </article>
  )
}
