import type { SearchConfig } from '../core/types'
import type { Hit } from '../core/types'

export const listingConfig: SearchConfig = {
  searchableFields: ['title', 'description', 'location', 'type'],
  facets: [
    { key: 'type', label: 'Type de logement' },
    { key: 'location', label: 'Ville' },
  ],
  sortOptions: [
    { key: '', label: 'Pertinence' },
    {
      key: 'price_asc',
      label: 'Prix croissant',
      comparator: (a: Hit, b: Hit) => (Number(a.price) || 0) - (Number(b.price) || 0),
    },
    {
      key: 'price_desc',
      label: 'Prix décroissant',
      comparator: (a: Hit, b: Hit) => (Number(b.price) || 0) - (Number(a.price) || 0),
    },
  ],
}

export const studentConfig: SearchConfig = {
  searchableFields: ['name', 'university', 'bio', 'city'],
  facets: [
    { key: 'university', label: 'Université' },
    { key: 'city', label: 'Ville' },
  ],
  sortOptions: [
    { key: '', label: 'Pertinence' },
    {
      key: 'name_asc',
      label: 'Nom A→Z',
      comparator: (a: Hit, b: Hit) => String(a.name ?? '').localeCompare(String(b.name ?? '')),
    },
  ],
}

export const ownerConfig: SearchConfig = {
  searchableFields: ['name', 'email', 'city'],
  facets: [
    { key: 'city', label: 'Ville' },
  ],
  sortOptions: [
    { key: '', label: 'Pertinence' },
    {
      key: 'listings_desc',
      label: 'Nb. annonces',
      comparator: (a: Hit, b: Hit) => (Number(b.listingCount) || 0) - (Number(a.listingCount) || 0),
    },
  ],
}
