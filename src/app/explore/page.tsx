'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { HousingListing, MapLocation } from '@/types/housing'
import CitySearchBar from '@/features/map/CitySearchBar'
import { InstantSearch } from '@/features/search/core/SearchContext'
import { Hits, Stats, Pagination } from '@/features/search/widgets/Widgets'
import { ListingCard } from '@/features/search/cards/ListingCard'
import type { Hit } from '@/features/search/core/types'
import type { SearchConfig } from '@/features/search/core/types'
import { useSearch } from '@/features/search/core/SearchContext'

const MapView = dynamic(() => import('@/features/map/MapView'), { ssr: false })

type PriceFilter = 'all' | 'low' | 'mid' | 'high'
type TypeFilter = 'all' | 'Studio' | 'T1' | 'T2' | 'T3' | 'T4' | 'Chambre' | 'Colocation' | 'Maison'
type SurfaceFilter = 'all' | 'xs' | 'sm' | 'md' | 'lg'
type FurnishedFilter = 'all' | 'yes' | 'no'

const PRICE_CHIPS: { id: PriceFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'low', label: '< 500 €' },
  { id: 'mid', label: '500 – 800 €' },
  { id: 'high', label: '> 800 €' },
]

const TYPE_CHIPS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'Studio', label: 'Studio' },
  { id: 'T1', label: 'T1' },
  { id: 'T2', label: 'T2' },
  { id: 'T3', label: 'T3' },
  { id: 'T4', label: 'T4' },
  { id: 'Chambre', label: 'Chambre' },
  { id: 'Colocation', label: 'Colocation' },
  { id: 'Maison', label: 'Maison' },
]

const SURFACE_CHIPS: { id: SurfaceFilter; label: string }[] = [
  { id: 'all', label: 'Toute surface' },
  { id: 'xs', label: '< 20 m²' },
  { id: 'sm', label: '20 – 40 m²' },
  { id: 'md', label: '40 – 60 m²' },
  { id: 'lg', label: '> 60 m²' },
]

const FURNISHED_CHIPS: { id: FurnishedFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'yes', label: 'Meublé' },
  { id: 'no', label: 'Non meublé' },
]

function applyPriceFilter(listings: HousingListing[], filter: PriceFilter): HousingListing[] {
  if (filter === 'all') return listings
  if (filter === 'low') return listings.filter(l => (l.price ?? 0) < 500)
  if (filter === 'mid') return listings.filter(l => (l.price ?? 0) >= 500 && (l.price ?? 0) <= 800)
  return listings.filter(l => (l.price ?? 0) > 800)
}

function applyTypeFilter(listings: HousingListing[], filter: TypeFilter): HousingListing[] {
  if (filter === 'all') return listings
  return listings.filter(l => (l.type ?? '').toLowerCase() === filter.toLowerCase())
}

function applySurfaceFilter(listings: HousingListing[], filter: SurfaceFilter): HousingListing[] {
  if (filter === 'all') return listings
  if (filter === 'xs') return listings.filter(l => (l.surface ?? 0) < 20)
  if (filter === 'sm') return listings.filter(l => (l.surface ?? 0) >= 20 && (l.surface ?? 0) <= 40)
  if (filter === 'md') return listings.filter(l => (l.surface ?? 0) > 40 && (l.surface ?? 0) <= 60)
  return listings.filter(l => (l.surface ?? 0) > 60)
}

function applyFurnishedFilter(listings: HousingListing[], filter: FurnishedFilter): HousingListing[] {
  if (filter === 'all') return listings
  if (filter === 'yes') return listings.filter(l => l.furnished === true)
  return listings.filter(l => l.furnished === false)
}

// Sort chips rendered inside InstantSearch context
function SortChips() {
  const { handleSort, sortKey } = useSearch()
  const options = [
    { key: '', label: 'Pertinence' },
    { key: 'price_asc', label: 'Prix ↑' },
    { key: 'price_desc', label: 'Prix ↓' },
  ]
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map(opt => {
        const active = sortKey === opt.key
        return (
          <button
            key={opt.key}
            onClick={() => handleSort(opt.key)}
            style={{
              padding: '6px 14px', borderRadius: 99, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'var(--accent)' : 'var(--surface)',
              color: active ? '#fff' : 'var(--text)',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// Reusable chip button
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 99, cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        background: active ? 'var(--accent)' : 'var(--surface)',
        color: active ? '#fff' : 'var(--text)',
        transition: 'all 0.15s',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

// Convert HousingListing → InstantSearch Hit
function toHit(l: HousingListing): Hit {
  return {
    id: l.id,
    title: l.title,
    description: l.description ?? '',
    location: l.city,
    price: l.price ?? 0,
    images: l.imageUrl ? [l.imageUrl] : [],
    type: l.type ?? '',
    lat: l.lat,
    lon: l.lon,
  } as unknown as Hit
}

const searchConfig: SearchConfig = {
  searchableFields: ['title', 'location', 'type'],
  facets: [
    { key: 'location', label: 'Ville' },
    { key: 'type', label: 'Type' },
  ],
  sortOptions: [
    { key: '', label: 'Pertinence' },
    {
      key: 'price_asc',
      label: 'Prix ↑',
      comparator: (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0),
    },
    {
      key: 'price_desc',
      label: 'Prix ↓',
      comparator: (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0),
    },
  ],
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', height: 'calc(100vh - 60px)', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Chargement…</div>}>
      <ExploreContent />
    </Suspense>
  )
}

function ExploreContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const cityParam = searchParams.get('city') ?? ''
  const latParam = parseFloat(searchParams.get('lat') ?? '0')
  const lonParam = parseFloat(searchParams.get('lon') ?? '0')
  const nameParam = searchParams.get('name') ?? cityParam

  const [location, setLocation] = useState<MapLocation | null>(
    cityParam ? { lat: latParam, lon: lonParam, name: nameParam, country: 'France' } : null
  )
  const [listings, setListings] = useState<HousingListing[]>([])
  const [loading, setLoading] = useState(false)
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [surfaceFilter, setSurfaceFilter] = useState<SurfaceFilter>('all')
  const [furnishedFilter, setFurnishedFilter] = useState<FurnishedFilter>('all')
  const [selectedListing, setSelectedListing] = useState<HousingListing | null>(null)

  // Fetch listings from DB
  const loadListings = useCallback(async (city: string) => {
    if (!city) return
    setLoading(true)
    try {
      const res = await fetch(`/api/logements?city=${encodeURIComponent(city)}&limit=250`)
      if (!res.ok) { setListings([]); return }
      const data = await res.json() as { listings?: HousingListing[] }
      setListings(Array.isArray(data.listings) ? data.listings : [])
    } catch {
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (cityParam) loadListings(cityParam)
  }, [cityParam, loadListings])

  // City change from search bar
  const handleCitySelect = (loc: MapLocation) => {
    setLocation(loc)
    setPriceFilter('all')
    setTypeFilter('all')
    setSurfaceFilter('all')
    setFurnishedFilter('all')
    const city = loc.name.split(',')[0].trim()
    const params = new URLSearchParams({
      city,
      lat: String(loc.lat),
      lon: String(loc.lon),
      name: loc.name,
    })
    router.replace(`/explore?${params.toString()}`)
    loadListings(city)
  }

  const filteredListings = useMemo(
    () => {
      let result = listings
      result = applyPriceFilter(result, priceFilter)
      result = applyTypeFilter(result, typeFilter)
      result = applySurfaceFilter(result, surfaceFilter)
      result = applyFurnishedFilter(result, furnishedFilter)
      return result
    },
    [listings, priceFilter, typeFilter, surfaceFilter, furnishedFilter]
  )
  const hits: Hit[] = filteredListings.map(toHit)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', background: 'var(--bg)', fontFamily: 'inherit' }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)', zIndex: 100, flexShrink: 0,
      }}>

        {/* Row 1: City search + count badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 20px', borderBottom: '1px solid var(--border)',
        }}>
          {/* City search */}
          <div style={{ flex: '1 1 260px', maxWidth: 400 }}>
            <CitySearchBar onSelect={handleCitySelect} variant="compact" initialValue={cityParam} />
          </div>

          {/* City / count badge */}
          {location && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, marginLeft: 'auto',
              background: 'var(--accent-alpha)', border: '1px solid var(--accent)',
              borderRadius: 99, padding: '5px 14px', fontSize: 12, color: 'var(--accent)',
              fontWeight: 600, flexShrink: 0,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
              {loading
                ? `${location.name.split(',')[0]} • chargement…`
                : `${location.name.split(',')[0]} • ${filteredListings.length} logement(s)`}
            </div>
          )}
        </div>

        {/* Row 2: Horizontally scrollable filter bar */}
        <div style={{
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          scrollbarWidth: 'none',
          // Hide scrollbar in webkit
          msOverflowStyle: 'none',
        } as React.CSSProperties}>

          {/* Prix */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Prix :
            </span>
            {PRICE_CHIPS.map(chip => (
              <FilterChip
                key={chip.id}
                label={chip.label}
                active={priceFilter === chip.id}
                onClick={() => setPriceFilter(chip.id)}
              />
            ))}
          </div>

          {/* Divider */}
          <span style={{ margin: '0 12px', color: 'var(--border)', fontSize: 18, fontWeight: 300, flexShrink: 0 }}>|</span>

          {/* Type */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Type :
            </span>
            {TYPE_CHIPS.map(chip => (
              <FilterChip
                key={chip.id}
                label={chip.label}
                active={typeFilter === chip.id}
                onClick={() => setTypeFilter(chip.id)}
              />
            ))}
          </div>

          {/* Divider */}
          <span style={{ margin: '0 12px', color: 'var(--border)', fontSize: 18, fontWeight: 300, flexShrink: 0 }}>|</span>

          {/* Surface */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Surface :
            </span>
            {SURFACE_CHIPS.map(chip => (
              <FilterChip
                key={chip.id}
                label={chip.label}
                active={surfaceFilter === chip.id}
                onClick={() => setSurfaceFilter(chip.id)}
              />
            ))}
          </div>

          {/* Divider */}
          <span style={{ margin: '0 12px', color: 'var(--border)', fontSize: 18, fontWeight: 300, flexShrink: 0 }}>|</span>

          {/* Meublé */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Meublé :
            </span>
            {FURNISHED_CHIPS.map(chip => (
              <FilterChip
                key={chip.id}
                label={chip.label}
                active={furnishedFilter === chip.id}
                onClick={() => setFurnishedFilter(chip.id)}
              />
            ))}
          </div>

        </div>
      </div>

      {/* ── Main split layout ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* LEFT — Map (50%) */}
        <div style={{
          width: '50%', flexShrink: 0, position: 'relative',
          borderRight: '1px solid var(--border)',
        }}>
          <MapView location={location} listings={filteredListings} onMarkerClick={setSelectedListing} />
          {!location && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(240,244,255,0.85)', backdropFilter: 'blur(4px)',
              color: 'var(--text-muted)', gap: 12,
            }}>
              <span style={{ fontSize: 48 }}>🗺️</span>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                Recherchez une ville pour voir les logements
              </p>
            </div>
          )}
        </div>

        {/* RIGHT — Detail panel or Listings (50%) */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {selectedListing ? (
            /* ── Detail panel ── */
            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
              {/* Back button */}
              <div style={{
                padding: '12px 16px', background: 'var(--surface)',
                borderBottom: '1px solid var(--border)', flexShrink: 0,
              }}>
                <button
                  onClick={() => setSelectedListing(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                    color: 'var(--accent)', padding: 0,
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>←</span>
                  Retour aux résultats
                </button>
              </div>

              {/* Image */}
              {selectedListing.imageUrl && (
                <div style={{ width: '100%', height: 260, overflow: 'hidden', background: 'var(--border)' }}>
                  <img
                    src={selectedListing.imageUrl}
                    alt={selectedListing.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Content */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Type badge */}
                {selectedListing.type && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: 0.8, color: 'var(--accent)',
                    background: 'var(--accent-alpha)', padding: '4px 10px',
                    borderRadius: 99, alignSelf: 'flex-start',
                  }}>
                    {selectedListing.type}
                  </span>
                )}

                {/* Title */}
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1.3 }}>
                  {selectedListing.title}
                </h2>

                {/* Location */}
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📍</span>
                  {selectedListing.address ? `${selectedListing.address}, ` : ''}
                  {selectedListing.city}
                  {selectedListing.country ? `, ${selectedListing.country}` : ''}
                </p>

                {/* Price */}
                {selectedListing.price != null && (
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff', padding: '14px 20px', borderRadius: 12,
                    display: 'flex', alignItems: 'baseline', gap: 6,
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 800 }}>
                      {selectedListing.price.toLocaleString('fr-FR')} €
                    </span>
                    <span style={{ fontSize: 14, opacity: 0.85 }}>/mois</span>
                  </div>
                )}

                {/* Info chips */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {selectedListing.surface != null && (
                    <div style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '10px 16px', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 80,
                    }}>
                      <span style={{ fontSize: 18 }}>📐</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{selectedListing.surface} m²</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Surface</span>
                    </div>
                  )}
                  {selectedListing.rooms != null && (
                    <div style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '10px 16px', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 80,
                    }}>
                      <span style={{ fontSize: 18 }}>🚪</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{selectedListing.rooms}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pièce(s)</span>
                    </div>
                  )}
                  {selectedListing.furnished != null && (
                    <div style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '10px 16px', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 80,
                    }}>
                      <span style={{ fontSize: 18 }}>🛋️</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                        {selectedListing.furnished ? 'Oui' : 'Non'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Meublé</span>
                    </div>
                  )}
                  {selectedListing.available_from && (
                    <div style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '10px 16px', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 80,
                    }}>
                      <span style={{ fontSize: 18 }}>📅</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{selectedListing.available_from}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Disponible</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedListing.description && (
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                      Description
                    </h3>
                    <p style={{
                      margin: 0, fontSize: 14, color: 'var(--text-muted)',
                      lineHeight: 1.7, whiteSpace: 'pre-line',
                    }}>
                      {selectedListing.description}
                    </p>
                  </div>
                )}

                {/* Contact button */}
                <button style={{
                  marginTop: 8, padding: '14px 0', borderRadius: 12,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 15, fontWeight: 700, color: '#fff',
                  background: 'linear-gradient(135deg, var(--accent) 0%, #2563eb 100%)',
                  boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.3)' }}
                >
                  Contacter le propriétaire
                </button>
              </div>
            </div>
          ) : (
            /* ── Listing grid ── */
            <InstantSearch data={hits} config={searchConfig} perPage={8}>

              {/* Toolbar: stats + sort chips */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px', borderBottom: '1px solid var(--border)',
                background: 'var(--surface)', flexShrink: 0, gap: 10, flexWrap: 'wrap',
              }}>
                <Stats />
                <SortChips />
              </div>

              {/* Cards */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} style={{ height: 130, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', opacity: 0.6 }} />
                    ))}
                  </div>
                ) : !location ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 16px', fontSize: 14 }}>
                    Lancez une recherche pour voir les annonces.
                  </div>
                ) : (
                  <Hits<Hit>
                    renderHit={(hit) => <ListingCard hit={hit} />}
                    emptyMessage="Aucun logement trouvé pour cette ville."
                  />
                )}
              </div>

              {/* Pagination */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
                <Pagination />
              </div>
            </InstantSearch>
          )}
        </div>
      </div>
    </div>
  )
}
