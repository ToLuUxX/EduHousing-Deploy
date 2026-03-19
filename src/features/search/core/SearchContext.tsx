'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { useSearchStore } from '../store/useSearchStore'
import { buildSearchEngine } from './SearchEngine'
import type { Hit, SearchConfig, SearchResults } from './types'

interface SearchContextValue {
  query: string
  filters: Record<string, string[]>
  sortKey: string
  page: number
  results: SearchResults
  loading: boolean
  config: SearchConfig
  activeFiltersCount: number
  handleQuery: (value: string) => void
  handleSort: (key: string) => void
  toggleFilter: (key: string, value: string) => void
  clearAll: () => void
  setPage: (page: number) => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used inside <InstantSearch>')
  return ctx
}

interface InstantSearchProps {
  data: Hit[]
  config: SearchConfig
  perPage?: number
  children: ReactNode
}

export function InstantSearch({ data, config, perPage = 6, children }: InstantSearchProps) {
  const store = useSearchStore()
  const engineRef = useRef(buildSearchEngine(data, config))
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    engineRef.current = buildSearchEngine(data, config)
  }, [data, config])

  useEffect(() => {
    store.init(config)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    store.setLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const results = engineRef.current({
        query: store.query,
        filters: store.filters,
        sortKey: store.sortKey,
        page: store.page,
        perPage,
      })
      store.setResults(results)
      store.setLoading(false)
    }, 120)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.query, store.filters, store.sortKey, store.page, perPage])

  const handleQuery = useCallback((value: string) => { store.setQuery(value); store.setPage(0) }, [store])
  const handleSort = useCallback((key: string) => { store.setSortKey(key); store.setPage(0) }, [store])
  const toggleFilter = useCallback((key: string, value: string) => { store.toggleFilter(key, value); store.setPage(0) }, [store])
  const clearAll = useCallback(() => { store.init(config) }, [config, store])

  const activeFiltersCount = Object.values(store.filters).flat().length

  return (
    <SearchContext.Provider value={{
      query: store.query, filters: store.filters, sortKey: store.sortKey,
      page: store.page, results: store.results, loading: store.loading,
      config, activeFiltersCount,
      handleQuery, handleSort, toggleFilter, clearAll, setPage: store.setPage,
    }}>
      {children}
    </SearchContext.Provider>
  )
}