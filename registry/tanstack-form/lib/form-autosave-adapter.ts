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