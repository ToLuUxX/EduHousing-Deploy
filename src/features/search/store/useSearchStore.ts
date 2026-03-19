import { create } from 'zustand'
import type { SearchConfig, SearchFilters, SearchResults } from '../core/types'

interface SearchStore {
  query: string
  filters: SearchFilters
  sortKey: string
  page: number
  loading: boolean
  results: SearchResults
  init: (config: SearchConfig) => void
  setQuery: (query: string) => void
  setFilters: (filters: SearchFilters) => void
  toggleFilter: (key: string, value: string) => void
  setSortKey: (key: string) => void
  setPage: (page: number) => void
  setLoading: (loading: boolean) => void
  setResults: (results: SearchResults) => void
}

const defaultResults: SearchResults = {
  hits: [],
  total: 0,
  nbPages: 1,
  facets: {},
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  filters: {},
  sortKey: '',
  page: 0,
  loading: false,
  results: defaultResults,

  init: (config) =>
    set({
      query: '',
      filters: Object.fromEntries((config.facets ?? []).map((f) => [f.key, []])),
      sortKey: config.sortOptions?.[0]?.key ?? '',
      page: 0,
      results: defaultResults,
    }),

  setQuery: (query) => set({ query }),
  setFilters: (filters) => set({ filters }),
  toggleFilter: (key, value) =>
    set((state) => {
      const current = state.filters[key] ?? []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { filters: { ...state.filters, [key]: next } }
    }),
  setSortKey: (sortKey) => set({ sortKey }),
  setPage: (page) => set({ page }),
  setLoading: (loading) => set({ loading }),
  setResults: (results) => set({ results }),
}))