'use client'

import { useState } from 'react'
import { InstantSearch } from '@/features/search/core/SearchContext'
import { SearchBox } from '@/features/search/widgets/SearchBox'
import { RefinementList } from '@/features/search/widgets/RefinementList'
import { Hits, SortBy, Stats, Pagination } from '@/features/search/widgets/Widgets'
import { ListingCard } from '@/features/search/cards/ListingCard'
import { StudentCard } from '@/features/search/cards/StudentOwnerCards'
import { OwnerCard } from '@/features/search/cards/StudentOwnerCards'
import { listingConfig, studentConfig, ownerConfig } from '@/features/search/configs'
import type { Hit } from '@/features/search/core/types'

type Category = 'listings' | 'students' | 'owners'

// ---------------------------------------------------------------------------
// Demo data — replace with real API data via props, fetch, or React Query
// ---------------------------------------------------------------------------
const DEMO_LISTINGS: Hit[] = [
  { id: '1', title: 'Studio Belleville', type: 'Studio', location: 'Paris', price: 650, description: 'Studio lumineux, proche métro.' },
  { id: '2', title: 'T2 Bordeaux Centre', type: 'T2', location: 'Bordeaux', price: 720, description: 'Appartement refait à neuf.' },
  { id: '3', title: 'Chambre Rez-de-chaussée', type: 'Chambre', location: 'Lyon', price: 430, description: 'Chambre dans colocation.' },
  { id: '4', title: 'T3 Colocataires', type: 'T3', location: 'Toulouse', price: 890, description: 'Grand appartement, 3 pièces.' },
  { id: '5', title: 'Studio Montpellier', type: 'Studio', location: 'Montpellier', price: 510, description: 'Proche université.' },
  { id: '6', title: 'T2 Nantes', type: 'T2', location: 'Nantes', price: 680, description: 'Balcon, parking inclus.' },
]

const DEMO_STUDENTS: Hit[] = [
  { id: 's1', name: 'Alice Martin', university: 'Sorbonne', city: 'Paris', bio: 'Étudiante en droit, cherche logement calme.' },
  { id: 's2', name: 'Lucas Pereira', university: 'INSA Lyon', city: 'Lyon', bio: 'Ingénierie informatique, sérieux et discret.' },
  { id: 's3', name: 'Emma Durand', university: 'Sciences Po', city: 'Paris', bio: 'Master relations internationales.' },
]

const DEMO_OWNERS: Hit[] = [
  { id: 'o1', name: 'Jean-Pierre Lefèvre', email: 'jp@example.com', city: 'Paris', listingCount: 4 },
  { id: 'o2', name: 'Sophie Renaud', email: 'sophie@example.com', city: 'Lyon', listingCount: 2 },
  { id: 'o3', name: 'Marc Vidal', email: 'marc@example.com', city: 'Bordeaux', listingCount: 1 },
]

const TABS: { id: Category; label: string }[] = [
  { id: 'listings', label: 'Logements' },
  { id: 'students', label: 'Étudiants' },
  { id: 'owners', label: 'Propriétaires' },
]

function CategoryContent({ category }: { category: Category }) {
  if (category === 'listings') {
    return (
      <InstantSearch data={DEMO_LISTINGS} config={listingConfig} perPage={6}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <SearchBox style={{ flex: 1, minWidth: 240 } as React.CSSProperties} />
            <SortBy />
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <aside style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <RefinementList facetKey="type" label="Type" />
              <RefinementList facetKey="location" label="Ville" />
            </aside>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Stats />
              <Hits<Hit> renderHit={(hit) => <ListingCard hit={hit} />} />
              <Pagination />
            </div>
          </div>
        </div>
      </InstantSearch>
    )
  }

  if (category === 'students') {
    return (
      <InstantSearch data={DEMO_STUDENTS} config={studentConfig} perPage={6}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SearchBox />
          <div style={{ display: 'flex', gap: 24 }}>
            <aside style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <RefinementList facetKey="university" label="Université" />
              <RefinementList facetKey="city" label="Ville" />
            </aside>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Stats />
              <Hits<Hit> renderHit={(hit) => <StudentCard hit={hit} />} />
              <Pagination />
            </div>
          </div>
        </div>
      </InstantSearch>
    )
  }

  return (
    <InstantSearch data={DEMO_OWNERS} config={ownerConfig} perPage={6}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <SearchBox />
        <div style={{ display: 'flex', gap: 24 }}>
          <aside style={{ width: 220, flexShrink: 0 }}>
            <RefinementList facetKey="city" label="Ville" />
          </aside>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Stats />
            <Hits<Hit> renderHit={(hit) => <OwnerCard hit={hit} />} />
            <Pagination />
          </div>
        </div>
      </div>
    </InstantSearch>
  )
}

export function SearchPageClient() {
  const [category, setCategory] = useState<Category>('listings')

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: '32px 16px',
      fontFamily: 'system-ui, sans-serif',
      color: 'var(--text)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>Recherche</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, alignSelf: 'flex-start' }}>
          {TABS.map((tab) => {
            const active = tab.id === category
            return (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                style={{
                  padding: '8px 18px',
                  border: 'none',
                  borderRadius: 9,
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-muted)',
                  fontWeight: active ? 700 : 400,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.12s',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <CategoryContent category={category} />
      </div>
    </main>
  )
}
