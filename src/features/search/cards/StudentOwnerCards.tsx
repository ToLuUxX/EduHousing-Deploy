import { Highlight } from '../widgets/Highlight'
import { useSearch } from '../core/SearchContext'
import type { Hit } from '../core/types'

// ---------------------------------------------------------------------------
// StudentCard
// ---------------------------------------------------------------------------
interface StudentCardProps {
  hit: Hit
}

export function StudentCard({ hit }: StudentCardProps) {
  const { query } = useSearch()

  return (
    <article
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
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
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'var(--accent-alpha)',
        border: '2px solid var(--accent)',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
      }}>
        {hit.avatar ? (
          <img src={String(hit.avatar)} alt={String(hit.name ?? '')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : '🎓'}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
          <Highlight text={String(hit.name ?? '')} query={query} />
        </h3>
        {hit.university && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
            <Highlight text={String(hit.university)} query={query} />
          </p>
        )}
        {hit.city && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>📍 {String(hit.city)}</p>
        )}
        {hit.bio && (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
            <Highlight text={String(hit.bio)} query={query} />
          </p>
        )}
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// OwnerCard
// ---------------------------------------------------------------------------
interface OwnerCardProps {
  hit: Hit
}

export function OwnerCard({ hit }: OwnerCardProps) {
  const { query } = useSearch()

  return (
    <article
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
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
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'var(--accent-alpha)',
        border: '2px solid var(--accent)',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
      }}>
        {hit.avatar ? (
          <img src={String(hit.avatar)} alt={String(hit.name ?? '')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : '🏠'}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
          <Highlight text={String(hit.name ?? '')} query={query} />
        </h3>
        {hit.email && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            <Highlight text={String(hit.email)} query={query} />
          </p>
        )}
        {hit.city && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>📍 {String(hit.city)}</p>
        )}
        {hit.listingCount != null && (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
            {Number(hit.listingCount)} annonce{Number(hit.listingCount) !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </article>
  )
}
