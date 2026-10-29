# ts-utils

Type-level utilities that keep reappearing. One file, no runtime code, no
dependencies.

```bash
npx shadcn@latest add https://shadcn.krzysztof.kazor.com/r/ts-utils.json
```

| Type | Purpose |
| --- | --- |
| `Prettify<T>` | flatten an intersection so tooltips show the real object |
| `Autocomplete<T>` | a string union that still accepts any string, keeping suggestions |
| `CommonProperties<A, B>` | the properties two types share, value types reconciled |
| `CommonPropertiesRecursive<[A, B, C]>` | the same, folded across a tuple |
| `PrefixedKeys<T, P>` / `SuffixedKeys<T, S>` | rename every key |
| `WithRequired<T, K>` | mark a key required without changing its type |

Deliberately excludes anything TypeScript already ships — `Partial`, `Pick`,
`Omit`, `Awaited`, `NoInfer`. Everything here fills a gap the standard library
doesn't.

## The two non-obvious ones

**`Autocomplete`** exists because `'sm' | 'md' | string` collapses to `string`,
and your editor's suggestions vanish with it. The `string & {}` branch is
opaque enough to prevent the collapse while staying assignable from any string:

```ts
type Size = Autocomplete<'sm' | 'md' | 'lg'>
const a: Size = 'sm'       // suggested
const b: Size = '13.5rem'  // still allowed
```

**`WithRequired`** narrows optionality *only*. Because the added value type is
`{}`, the original type survives the intersection — unlike
`Required<Pick<T, K>> & Omit<T, K>`, which also strips `undefined` out of the
value itself. Use it when a key must be present but its type should not
otherwise change.

## Overlap with other items

`Prettify` and `PrefixedKeys` are also bundled inside
[`store-slice`](../store-slice), which is self-contained on purpose so it can be
installed alone. If you install both, delete the duplicates from whichever you
consider secondary — they are identical definitions.
