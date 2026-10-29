import { useCallback, useRef, useState } from 'react'

export interface RemainingHeight {
  /** Pixels from the element's top edge to the bottom of the viewport, minus `offset`. */
  height: number
  /** True until the first measurement lands. */
  isLoading: boolean
  /** Attach to the element whose remaining height you want: `<div ref={getHeight}>`. */
  getHeight: (node: HTMLElement | null) => void
  recalculate: () => void
}

/**
 * Measures how much vertical space is left between an element's top edge and
 * the bottom of the viewport — the usual way to size a scroll area that should
 * fill the rest of the page without a fixed height.
 *
 * Watches three things, because any of them can change the answer without the
 * others firing: window resize, the element's own box (ResizeObserver), and
 * structural or style changes in the parent (MutationObserver).
 *
 * Requires React 19: this returns a cleanup function from a callback ref,
 * which earlier versions silently ignore.
 */
export function useRemainingHeight(offset = 0): RemainingHeight {
  const [height, setHeight] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const nodeRef = useRef<HTMLElement | null>(null)

  const updateHeight = useCallback(() => {
    if (!nodeRef.current) return
    // Deferred a frame so the measurement reflects the layout after whatever
    // change triggered it, not the one before.
    requestAnimationFrame(() => {
      const node = nodeRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      setHeight(Math.max(0, window.innerHeight - rect.top - offset))
      setIsLoading(false)
    })
  }, [offset])

  const getHeight = useCallback(
    (node: HTMLElement | null) => {
      nodeRef.current = node
      if (!node) return

      updateHeight()
      window.addEventListener('resize', updateHeight)

      const resizeObserver = new ResizeObserver(updateHeight)
      const mutationObserver = new MutationObserver(updateHeight)

      resizeObserver.observe(node)
      if (node.parentElement) {
        resizeObserver.observe(node.parentElement)
        mutationObserver.observe(node.parentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class'],
        })
      }

      return () => {
        window.removeEventListener('resize', updateHeight)
        resizeObserver.disconnect()
        mutationObserver.disconnect()
      }
    },
    [updateHeight]
  )

  return { height, isLoading, getHeight, recalculate: updateHeight }
}
