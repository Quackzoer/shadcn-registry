import { RefObject, useLayoutEffect, useState } from 'react'

export interface ElementSize {
  width: number
  height: number
}

/**
 * Tracks an element's rendered width and height.
 *
 * Measures synchronously in a layout effect so the first paint has real
 * numbers, then keeps up to date via `ResizeObserver`.
 */
export function useElementSize<T extends HTMLElement = HTMLElement>(
  ref?: RefObject<T | null>
): ElementSize {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const element = ref?.current
    if (!element) {
      setSize({ width: 0, height: 0 })
      return
    }

    const measure = () => {
      const rect = element.getBoundingClientRect()
      // getBoundingClientRect reports 0 for elements that are laid out but not
      // yet painted; offset/client sizes are the fallbacks that do report.
      const next = {
        width: rect.width || element.offsetWidth || element.clientWidth,
        height: rect.height || element.offsetHeight || element.clientHeight,
      }
      setSize((prev) =>
        prev.width === next.width && prev.height === next.height ? prev : next
      )
    }

    measure()

    // ResizeObserver fires once on observe, which covers the case where the
    // element is measurable only after layout settles.
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return size
}
