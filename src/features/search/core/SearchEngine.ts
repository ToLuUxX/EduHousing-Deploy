import type { Hit, SearchConfig, SearchFilters, SearchResults } from './types'

interface SearchParams {
  query: string
  filters: SearchFilters
  sortKey: string
  page: number
  perPage: number
}

function normalize(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => {
    if (o && typeof o === 'object') return (o as Record<string, unknown>)[k]
    return undefined
  }, obj)
}

export function buildSearchEngine(data: Hit[], config: SearchConfig) {
  return function search(params: SearchParams): SearchResults {
    const { query, filters, sortKey, page, perPage } = params
    let results = [...data]

    if (query.trim()) {
      const q = normalize(query)
      results = results.filter((item) =>
        config.searchableFields.some((field) => {
          const val = getNestedValue(item, field)
          if (val == null) return false
          if (Array.isArray(val)) return val.some((v) => normalize(String(v)).includes(q))
          return normalize(String(val)).includes(q)
        })
      )
    }

    Object.entries(filters).forEach(([key, values]) => {
      if (!values.length) return
      results = results.filter((item) => {
        const val = getNestedValue(item, key)
        if (Array.isArray(val)) return val.some((v) => values.includes(String(v)))
        return values.includes(String(val))
      })
    })

    const facets: Record<string, Record<string, number>> = {}
    config.facets?.forEach(({ key }) => {
      facets[key] = {}
      results.forEach((item) => {
        const val = getNestedValue(item, key)
        const vals = Array.isArray(val) ? val : [val]
        vals.forEach((v) => {
          if (v != null) {
            const k = String(v)
            facets[key][k] = (facets[key][k] || 0) + 1
          }
        })
      })
    })

    if (sortKey && config.sortOptions) {
      const opt = config.sortOptions.find((s) => s.key === sortKey)
      if (opt?.comparator) results = [...results].sort(opt.comparator)
    }

    const total = results.length
    const nbPages = Math.ceil(total / perPage) || 1
    const hits = results.slice(page * perPage, (page + 1) * perPage)

    return { hits, total, nbPages, facets }
  }
}