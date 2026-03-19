'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { HousingListing, MapLocation } from '@/types/housing'
import CitySearchBar from '@/features/map/CitySearchBar'
import { InstantSearch } from '@/features/search/core/SearchContext'
import { Hits, Stats, Pagination, SortBy } from '@/features/search/widgets/Widgets'
import { RefinementList } from '@/features/search/widgets/RefinementList'
import { ListingCard } from '@/features/search/cards/ListingCard'
import type { Hit } from '@/features/search/core/types'
import type { SearchConfig } from '@/features/search/core/types'

const MapView = dynamic(() => import('@/features/map/MapView'), { ssr: false })

// Convert HousingListing → InstantSearch Hit
function toHit(l: HousingListing): Hit {
  return {
    id: l.id,
    title: l.title,
    description: '',
    location: l.city,
    price: l.price ?? 0,
    images: l.imageUrl ? [l.imageUrl] : [],
    type: '',
    // keep lat/lon for potential map sync
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const hits: Hit[] = listings.map(toHit)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', background: 'var(--bg)', fontFamily: 'inherit' }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 20px', background: 'var(--surface)',
        borderBottom: '1px solid var(--border)', zIndex: 100, flexShrink: 0,
      }}>
        <div style={{ flex: 1, maxWidth: 440 }}>
          <CitySearchBar onSelect={handleCitySelect} variant="compact" initialValue={cityParam} />
        </div>

        {location && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'var(--accent-alpha)', border: '1px solid var(--accent)',
            borderRadius: 99, padding: '5px 14px', fontSize: 12, color: 'var(--accent)',
            fontWeight: 600, flexShrink: 0,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
            {loading ? `${location.name.split(',')[0]} • chargement…` : `${location.name.split(',')[0]} • ${listings.length} logement(s)`}
          </div>
        )}

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            display: 'none',
            padding: '8px 14px', background: 'var(--surface)',
            border: '1.5px solid var(--border)', borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
          className="mobile-toggle"
        >
          {sidebarOpen ? '🗺 Carte' : '📋 Liste'}
        </button>
      </div>

      {/* ── Main split layout ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* LEFT — Map (50%) */}
        <div style={{
          width: '50%', flexShrink: 0, position: 'relative',
          borderRight: '1px solid var(--border)',
        }}>
          <MapView location={location} listings={listings} />
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

        {/* RIGHT — Listings (50%) */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <InstantSearch data={hits} config={searchConfig} perPage={8}>
            <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

              {/* Sidebar filters */}
              <aside style={{
                width: 220, flexShrink: 0,
                padding: '16px 12px',
                borderRight: '1px solid var(--border)',
                overflowY: 'auto',
                background: 'var(--surface)',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>
                  Filtres
                </p>
                <RefinementList facetKey="location" label="Ville" />
                <RefinementList facetKey="type" label="Type" />
              </aside>

              {/* Results */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {/* Toolbar */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  background: 'var(--surface)', flexShrink: 0,
                }}>
                  <Stats />
                  <SortBy />
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
              </div>
            </div>
          </InstantSearch>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
