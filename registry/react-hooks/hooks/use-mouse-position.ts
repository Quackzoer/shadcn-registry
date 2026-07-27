import { useEffect, useState } from 'react'

export interface MousePosition {
  x: number | null
  y: number | null
}

/**
 * The pointer's current viewport coordinates, or `null` before the first move.
 *
 * Note this re-renders on every `mousemove`. For anything that only needs the
 * position at a moment in time (a context menu, a drag start), read it from
 * the event instead.
 */
export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: null, y: null })

  useEffect(() => {
    const update = (event: MouseEvent) =>
      setPosition({ x: event.clientX, y: event.clientY })

    window.addEventListener('mousemove', update)
    return () => window.removeEventListener('mousemove', update)
  }, [])

  return position
}
