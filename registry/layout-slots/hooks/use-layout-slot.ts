'use client'

import { useEffect, type ReactNode } from 'react'

import type { LayoutSlotsSlice } from '../lib/layout-slots-slice'

/** Structural shape of a zustand hook (`UseBoundStore<StoreApi<T>>`). */
export interface StoreHookLike<TStore> {
  <TReturn>(selector: (state: TStore) => TReturn): TReturn
}

/**
 * Binds the slot hooks to your store once:
 *
 * ```ts
 * export const { useLayoutSlot, useSlotContent } =
 *   createLayoutSlotHooks<AppStore, Slot>(useAppStore)
 * ```
 */
export function createLayoutSlotHooks<
  TStore extends LayoutSlotsSlice<TSlot>,
  TSlot extends string = string,
>(useStore: StoreHookLike<TStore>) {
  /**
   * Fills a slot for as long as the calling component is mounted, and clears it
   * on unmount.
   *
   * The cleanup is the whole point. Without it, a route that sets header
   * actions leaves them behind when the user navigates away, and the next
   * screen inherits buttons that act on an entity it isn't showing.
   */
  function useLayoutSlot(name: TSlot, node: ReactNode): void {
    const setSlot = useStore((s) => s.layoutSlotActions.setSlot)
    const clearSlot = useStore((s) => s.layoutSlotActions.clearSlot)

    useEffect(() => {
      setSlot(name, node)
      return () => clearSlot(name)
    }, [name, node, setSlot, clearSlot])
  }

  /** Reads a slot's content. Use in the layout that renders the slot. */
  function useSlotContent(name: TSlot): ReactNode {
    return useStore((s) => s.layout_slots[name])
  }

  return { useLayoutSlot, useSlotContent }
}
