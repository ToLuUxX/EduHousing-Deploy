export interface SearchConfig {
  searchableFields: string[]
  facets?: FacetConfig[]
  sortOptions?: SortOption[]
}

export interface FacetConfig {
  key: string
  label: string
}

export interface SortOption {
  key: string
  label: string
  comparator?: (a: Hit, b: Hit) => number
}

export type Hit = Record<string, unknown> & { id: string | number }

export interface SearchFilters {
  [key: string]: string[]
}

export interface SearchResults {
  hits: Hit[]
  total: number
  nbPages: number
  facets: Record<string, Record<string, number>>
}