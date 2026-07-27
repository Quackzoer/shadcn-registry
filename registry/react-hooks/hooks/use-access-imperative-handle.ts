import { RefObject, useEffect, useState } from 'react'

/**
 * Makes a ref's current value readable as state.
 *
 * Assigning to `ref.current` does not re-render, so a parent that needs to
 * *render* something derived from a child's `useImperativeHandle` can't just
 * read `ref.current` — on first render it is still null. This mirrors the ref
 * into state so the parent re-renders once the handle is attached.
 *
 * Child effects commit before parent effects, so by the time this effect runs
 * the child's imperative handle is already assigned — no timeout needed.
 */
export function useAccessImperativeHandle<T>(
  ref: RefObject<T | null>
): T | null {
  const [handle, setHandle] = useState<T | null>(null)

  useEffect(() => {
    // Guarded so this only re-renders when the identity actually changes,
    // rather than on every commit.
    setHandle((prev) => (prev === ref.current ? prev : ref.current))
  })

  return handle
}
