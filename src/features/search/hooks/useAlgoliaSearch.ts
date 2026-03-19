/**
 * useAlgoliaSearch
 *
 * Thin wrapper around useSearch() that exposes an Algolia-like API surface.
 * To swap to a real Algolia client, replace the implementation of
 * SearchEngine.ts — this hook signature stays the same.
 */
import { useSearch } from '../core/SearchContext'
import type { Hit } from '../core/types'

export interface AlgoliaSearchResult<T extends Hit = Hit> {
  hits: T[]
  nbHits: number
  nbPages: number
  page: number
  query: string
  isLoading: boolean
  refinements: Record<string, string[]>
  facets: Record<string, Record<string, number>>
  refine: (facetKey: string, value: string) => void
  setQuery: (value: string) => void
  setPage: (page: number) => void
  clearAll: () => void
}

export function useAlgoliaSearch<T extends Hit = Hit>(): AlgoliaSearchResult<T> {
  const {
    results,
    query,
    filters,
    page,
    loading,
    handleQuery,
    toggleFilter,
    setPage,
    clearAll,
  } = useSearch()

  return {
    hits: results.hits as T[],
    nbHits: results.total,
    nbPages: results.nbPages,
    page,
    query,
    isLoading: loading,
    refinements: filters,
    facets: results.facets,
    refine: toggleFilter,
    setQuery: handleQuery,
    setPage,
    clearAll,
  }
}
