/**
 * Small type-level utilities that keep reappearing across projects.
 *
 * Deliberately excludes anything TypeScript already ships (`Partial`, `Pick`,
 * `Omit`, `Awaited`, `NoInfer`) — everything here fills a gap the standard
 * library doesn't.
 */

/**
 * Flattens an intersection into a single object literal.
 *
 * Purely cosmetic, and worth it: `A & B & C` renders in tooltips and errors as
 * the unresolved intersection, which is unreadable once the pieces are
 * generic. `Prettify` makes the editor show the object you actually get.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
} & {}

/**
 * A string union that still accepts any other string, without collapsing to
 * `string` and losing autocomplete.
 *
 * `'a' | 'b' | string` collapses to `string` — the suggestions disappear. The
 * `string & {}` branch is opaque enough to stop that collapse while remaining
 * assignable from any string.
 *
 * ```ts
 * type Size = Autocomplete<'sm' | 'md' | 'lg'>
 * const a: Size = 'sm'      // suggested
 * const b: Size = '13.5rem' // still allowed
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Autocomplete<T extends string> = T | (string & {})

/**
 * The properties two types share, with each value type reconciled.
 *
 * Where both sides agree, the shared type wins; where one is a subtype of the
 * other, the narrower wins; otherwise the result is a union of both. Useful
 * for writing one function against two related shapes — a DB row and its API
 * representation, say — without inventing a third interface.
 */
export type CommonProperties<A, B> = {
  [K in keyof A & keyof B]: A[K] extends B[K]
    ? B[K] extends A[K]
      ? A[K]
      : B[K]
    : A[K] | B[K]
}

/** @internal Pairwise step for `CommonPropertiesRecursive`. */
type _CommonTwo<A, B> = {
  [K in keyof A & keyof B]: A[K] extends B[K]
    ? B[K] extends A[K]
      ? A[K]
      : B[K]
    : A[K] | B[K]
}

/**
 * `CommonProperties` folded across a tuple of types.
 *
 * ```ts
 * type Shared = CommonPropertiesRecursive<[Org, Project, Survey]>
 * ```
 *
 * The practical use is deriving the shape a generic component can rely on when
 * it has to render several unrelated entities — the intersection of what they
 * all guarantee, computed rather than hand-maintained.
 */
export type CommonPropertiesRecursive<T extends unknown[]> = T extends [
  infer Only,
]
  ? Only
  : T extends [infer A, infer B, ...infer Rest]
    ? CommonPropertiesRecursive<[_CommonTwo<A, B>, ...Rest]>
    : never

/** Prefixes every key of an object type: `{ data: T }` + `'crm_'` → `{ crm_data: T }`. */
export type PrefixedKeys<T, P extends string> = {
  [K in keyof T as `${P}${string & K}`]: T[K]
}

/** Suffixes every key of an object type. */
export type SuffixedKeys<T, S extends string> = {
  [K in keyof T as `${string & K}${S}`]: T[K]
}

/**
 * Marks a key as required without changing its type.
 *
 * The `{}` value type means "present and not null/undefined" while leaving the
 * original type intact through the intersection — so this narrows optionality
 * only, unlike `Required<Pick<T, K>> & Omit<T, K>`, which also strips
 * `undefined` from the value itself.
 */
export type WithRequired<TTarget, TKey extends keyof TTarget> = TTarget & {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  [_ in TKey]: {}
}
