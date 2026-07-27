# react-hooks

Six small, dependency-free React hooks that keep reappearing in every project.

```bash
npx shadcn@latest add https://shadcn.krzysztof.kazor.com/r/react-hooks.json
```

| Hook | What it does |
| --- | --- |
| `useClickOutside(ref, handler)` | fires when a pointer lands outside an element |
| `useElementSize(ref)` | `{ width, height }`, kept current via `ResizeObserver` |
| `useMousePosition()` | `{ x, y }` viewport coordinates |
| `useAccessImperativeHandle(ref)` | makes a ref's value readable as render state |
| `useRemainingHeight(offset)` | space from an element's top edge to the viewport bottom |
| `usePaginationQueryState(defaults)` | pagination state stored in the URL |

Only `usePaginationQueryState` has a dependency (`nuqs`). If you don't want it,
delete that one file — nothing else references it.

## Notes on a few of them

**`useClickOutside`** listens on `mousedown`/`touchstart`, not `click`, so it
runs before the element under the pointer reacts — the usual reason you want
it, e.g. closing a menu before its trigger toggles again. The handler is held
in a ref, so passing an inline arrow function doesn't re-attach listeners every
render.

**`useRemainingHeight`** watches three separate things, because any one of them
can change the answer without the others firing: window resize, the element's
own box, and structural/style changes in the parent. It returns a callback ref
(`getHeight`) that cleans up its own observers — **this requires React 19**,
since earlier versions silently discard a callback ref's return value.

**`usePaginationQueryState`** uses `parseAsIndex`, so the URL reads `?page=1`
while the value stays 0-based. Keys are `page`/`perPage` in the URL and
`pageIndex`/`pageSize` in state, which drops straight into a TanStack Table
`pagination` state.

## Changes made during extraction

These were ported from an app where a couple had accumulated workarounds:

- `useElementSize` dropped a dead `debug` flag, its logging helper, and a
  `requestAnimationFrame` plus three staggered `setTimeout` re-measures. A
  `ResizeObserver` fires once on `observe`, which is what those were working
  around. It also bails out of `setState` when dimensions are unchanged.
- `useAccessImperativeHandle` no longer schedules a `setTimeout(…, 1)` from an
  effect with no dependency array — that ran on every render and left the
  timeouts uncleaned. Child effects commit before parent effects, so a plain
  effect already sees the child's imperative handle.
- Both `useClickOutside` and `useMousePosition` were `export default`; all six
  are named exports now.
