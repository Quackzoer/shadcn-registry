import { parseAsJson } from "nuqs"

export interface FormAutosaveAdapter {
  save(key: string, state: unknown): void | Promise<void>
  restore(key: string): unknown
}

export const localStorageAdapter: FormAutosaveAdapter = {
  save(key: string, state: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (error) {
      console.error(`Failed to save form state to localStorage (${key}):`, error)
    }
  },
  restore(key: string) {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error(`Failed to restore form state from localStorage (${key}):`, error)
      return null
    }
  }
}

export const searchParamsAdapter: FormAutosaveAdapter = {
  save(key: string, state: unknown) {
    try {
      if (typeof window === 'undefined') return

      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set(key, JSON.stringify(state))
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`
      window.history.replaceState({ path: newUrl }, '', newUrl)
    } catch (error) {
      console.error(`Failed to save form state to URL (${key}):`, error)
    }
  },
  restore(key: string) {
    try {
      if (typeof window === 'undefined') return null

      const searchParams = new URLSearchParams(window.location.search)
      const stored = searchParams.get(key)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error(`Failed to restore form state from URL (${key}):`, error)
      return null
    }
  }
}

export function createMemoryAdapter(): FormAutosaveAdapter {
  const storage = new Map<string, unknown>()
  return {
    save(key: string, state: unknown) {
      storage.set(key, state)
    },
    restore(key: string) {
      return storage.get(key) ?? null
    }
  }
}

export function nuqsAdapter<T = unknown>(
  schema?: (data: unknown) => T
): FormAutosaveAdapter {
  const parser = parseAsJson<T>(schema ? (v) => schema(v) : (v) => v as T)

  return {
    save(key: string, state: unknown) {
      if (typeof window === 'undefined') return

      const url = new URL(window.location.href)
      // Serialize state using nuqs parser logic
      const serialized = parser.serialize(state as T)

      if (serialized) {
        url.searchParams.set(key, serialized)
      } else {
        url.searchParams.delete(key)
      }

      // Sync state smoothly using nuqs history update
      window.history.replaceState(null, '', url.toString())
    },

    restore(key: string) {
      if (typeof window === 'undefined') return null

      const searchParams = new URLSearchParams(window.location.search)
      const rawValue = searchParams.get(key)

      if (!rawValue) return null
      return parser.parse(rawValue)
    }
  }
}