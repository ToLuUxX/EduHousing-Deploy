// Core
export { InstantSearch, useSearch } from './core/SearchContext'
export { buildSearchEngine } from './core/SearchEngine'
export type {
  Hit,
  SearchConfig,
  SearchFilters,
  SearchResults,
  FacetConfig,
  SortOption,
} from './core/types'

// Store
export { useSearchStore } from './store/useSearchStore'

// Widgets
export { SearchBox } from './widgets/SearchBox'
export { RefinementList } from './widgets/RefinementList'
export { Hits, SortBy, Stats, Pagination } from './widgets/Widgets'
export { Highlight } from './widgets/Highlight'

// Configs
export { listingConfig, studentConfig, ownerConfig } from './configs'

// Cards
export { ListingCard } from './cards/ListingCard'
export { StudentCard, OwnerCard } from './cards/StudentOwnerCards'

// Hooks
export { useAlgoliaSearch } from './hooks/useAlgoliaSearch'
export type { AlgoliaSearchResult } from './hooks/useAlgoliaSearch'
