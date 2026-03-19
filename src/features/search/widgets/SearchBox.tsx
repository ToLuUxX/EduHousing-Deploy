'use client'

import { useRef } from 'react'
import { useSearch } from '../core/SearchContext'

interface SearchBoxProps {
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}

export function SearchBox({ placeholder = 'Rechercher…', className, style }: SearchBoxProps) {
  const { query, handleQuery, clearAll, activeFiltersCount } = useSearch()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={className} style={{ position: 'relative', display: 'flex', gap: 8, alignItems: 'center', ...style }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.35, pointerEvents: 'none' }}>⌕</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px 40px 12px 42px', fontSize: 15, fontFamily: 'inherit', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, outline: 'none', color: 'var(--text)', transition: 'border-color 0.15s' }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-alpha)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />
        {query && (
          <button onClick={() => { handleQuery(''); inputRef.current?.focus() }}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, opacity: 0.4, lineHeight: 1 }}>×</button>
        )}
      </div>
      {activeFiltersCount > 0 && (
        <button onClick={clearAll}
          style={{ padding: '10px 14px', background: 'none', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 99, width: 18, height: 18, fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{activeFiltersCount}</span>
          Effacer
        </button>
      )}
    </div>
  )
}