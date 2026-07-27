import type { ReactNode } from 'react'

/** Minimal structural `set` — compatible with zustand's `StateCreator` set. */
export type SetLike<TStore> = (
  partial: Partial<TStore> | ((state: TStore) => Partial<TStore>)
) => void

export interface LayoutSlotsSlice<TSlot extends string = string> {
  layout_slots: Partial<Record<TSlot, ReactNode>>
  layoutSlotActions: {
    setSlot: (name: TSlot, node: ReactNode) => void
    clearSlot: (name: TSlot) => void
    resetSlots: () => void
  }
  layoutSlotGetters: {
    getSlot: (name: TSlot) => ReactNode
  }
}

/**
 * Lets a deeply nested route render content into a parent layout — a page title,
 * header buttons, a status chip — without prop drilling or a context per slot.
 *
 * The parent renders `getSlot('header-actions')`; a child anywhere below fills
 * it. Neither has to know about the other.
 *
 * ```ts
 * type Slot = 'title' | 'header-actions' | 'footer-actions'
 *
 * const useAppStore = create<AppStore>()((set, get) => ({
 *   ...createLayoutSlotsSlice<AppStore, Slot>()(set, get),
 * }))
 * ```
 *
 * Constraining `TSlot` to a union is worth doing: slot names are a contract
 * between two files that never import each other, so a typo is otherwise
 * silent — the content simply never appears.
 */
export const createLayoutSlotsSlice =
  <TStore extends LayoutSlotsSlice<TSlot>, TSlot extends string = string>() =>
  (set: SetLike<TStore>, get: () => TStore): LayoutSlotsSlice<TSlot> => {
    const write = (partial: Partial<LayoutSlotsSlice<TSlot>>) =>
      set(partial as Partial<TStore>)

    return {
      layout_slots: {},

      layoutSlotActions: {
        setSlot: (name, node) =>
          write({ layout_slots: { ...get().layout_slots, [name]: node } }),

        clearSlot: (name) => {
          const next = { ...get().layout_slots }
          delete next[name]
          write({ layout_slots: next })
        },

        resetSlots: () => write({ layout_slots: {} }),
      },

      layoutSlotGetters: {
        getSlot: (name) => get().layout_slots[name],
      },
    }
  }
