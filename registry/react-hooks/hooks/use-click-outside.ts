import { RefObject, useEffect, useRef } from 'react'

/**
 * Calls `handler` when a pointer event lands outside `ref`.
 *
 * Listens on both `mousedown` and `touchstart` rather than `click`, so the
 * handler runs before the element under the pointer can react — the usual
 * reason this hook exists (closing a menu before its trigger toggles again).
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  // Kept in a ref so an inline arrow function passed as `handler` does not
  // tear down and re-attach both listeners on every render.
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const el = ref.current
      if (!el || el.contains(event.target as Node)) return
      handlerRef.current(event)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [ref])
}
