'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { NominatimResult, MapLocation } from '@/types/housing'

interface CitySearchBarProps {
  onSelect: (location: MapLocation) => void
  /** Visual variant: 'hero' (large, on landing) | 'compact' (in explore header) */
  variant?: 'hero' | 'compact'
  initialValue?: string
}

export default function CitySearchBar({
  onSelect,
  variant = 'compact',
  initialValue = '',
}: CitySearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback(async (value: string) => {
    if (value.trim().length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=8&countrycodes=fr`,
        { headers: { 'Accept-Language': 'fr' } }
      )
      const data: NominatimResult[] = await res.json()
      const fr = data.filter((r) => r.address?.country_code?.toLowerCase() === 'fr')
      setResults(fr)
      setOpen(fr.length > 0)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 350)
  }

  const handleSelect = (r: NominatimResult) => {
    const city =
      r.address?.city || r.address?.town || r.address?.village || r.display_name.split(',')[0]
    setQuery(city)
    setOpen(false)
    onSelect({
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      name: r.address?.country ? `${city}, ${r.address.country}` : city,
      country: r.address?.country ?? '',
    })
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isHero = variant === 'hero'

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#ffffff',
        border: `${isHero ? '2px' : '1.5px'} solid ${focused ? '#3b82f6' : '#d1d9e6'}`,
        borderRadius: isHero ? 20 : 14,
        padding: isHero ? '0 20px' : '0 14px',
        height: isHero ? 64 : 48,
        boxShadow: focused
          ? '0 0 0 4px rgba(59,130,246,0.15)'
          : isHero
          ? '0 8px 32px rgba(15,23,42,0.18)'
          : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}>
        {/* Icon */}
        <span style={{ color: focused ? '#3b82f6' : '#94a3b8', display: 'flex', flexShrink: 0 }}>
          {loading ? (
            <svg width={isHero ? 22 : 18} height={isHero ? 22 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
              </circle>
            </svg>
          ) : (
            <svg width={isHero ? 22 : 18} height={isHero ? 22 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
          )}
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          onFocus={() => { setFocused(true); if (results.length > 0) setOpen(true) }}
          onBlur={() => setFocused(false)}
          placeholder={isHero ? 'Rechercher une ville en France…' : 'Changer de ville…'}
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#0f172a',
            fontSize: isHero ? 17 : 15,
            fontFamily: 'inherit',
          }}
        />

        {/* Clear */}
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: 4, borderRadius: '50%' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          overflow: 'hidden',
          listStyle: 'none',
          margin: 0,
          padding: '4px',
          zIndex: 9999,
          boxShadow: '0 20px 40px rgba(15,23,42,0.15)',
        }}>
          {results.map((r) => {
            const city = r.address?.city || r.address?.town || r.address?.village || r.display_name.split(',')[0]
            const sub = r.display_name.split(',').slice(1, 3).join(',').trim()
            return (
              <li
                key={r.place_id}
                onMouseDown={() => handleSelect(r)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderRadius: 10,
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f7ff')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: '#3b82f6', flexShrink: 0 }}>📍</span>
                <span style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{city}</div>
                  {sub && <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
                </span>
                {r.address?.country_code && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#2563eb', background: '#eaf2ff', border: '1px solid #cfe0ff', borderRadius: 4, padding: '2px 5px' }}>
                    {r.address.country_code.toUpperCase()}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
