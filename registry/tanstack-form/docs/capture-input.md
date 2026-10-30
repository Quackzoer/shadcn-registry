# Capture input

A text input that understands inline tokens — `Buy milk #errands @"Home reno" !high` —
highlights them, suggests values while you type, and hands back the text
**without** the tokens plus the tokens themselves.

Nothing in it is specific to tags, projects or to-dos. You supply a **parser**
(what a token looks like) and **sources** (where suggestions come from).

```tsx
<form.AppField name="title">
  {(field) => <field.Capture parser={parser} sources={{ tag: …, project: … }} />}
</form.AppField>

// on submit
const { value, tokens } = extractCapture(values.title, parser)
const { tag = [], project = [], priority = [] } = groupTokenValues(tokens)
```

Files (all under `@components/tanstack-form/…` once installed):

| File | What |
| --- | --- |
| `lib/capture/capture-parser.ts` | Pure functions. No React. |
| `components/fields/capture-input.tsx` | The input. Knows nothing about TanStack Form. |
| `components/fields/form-capture-field.tsx` | `field.Capture` for `useAppForm`. |

## Design

**One parse drives everything.** A parser is `(text, { final? }) => CaptureToken[]`.
From that single result the input derives the highlight (segments), the clean
value (`extractCapture`) and the token under the caret (suggestions).

**The raw text is the source of truth.** The field stores what was typed,
tokens included, so editing a token is just editing text — backspace over a tag
and it is gone. The clean value is derived, never stored. The alternative
(lifting a token out of the text when it is committed) needs two-way syncing
with whatever else holds the tags, and was rejected.

**A token ends at whitespace.** While it is still being typed it is
*incomplete* and drives suggestions. On submit `extractCapture` treats the end
of the text as a terminator (`final: true`), so `Buy milk #errands` + Enter keeps
the tag.

**Not every `#` is a token.** A trigger only counts at the start of the text or
after whitespace (`C#`, `a@b.com`, `Wow!` are left alone), and a bare trigger
(`# 5`) stays text once it is complete.

## Parsers

```ts
import {
  createPrefixParser, composeParsers, tagParser, projectParser, priorityParser,
} from "@/components/tanstack-form/lib/capture/capture-parser"

// Module scope: the input re-parses when the parser's identity changes.
export const parser = composeParsers(
  tagParser,                                   // #tag
  projectParser,                               // @project   or   @"two words"
  createPrefixParser({
    trigger: "!",
    kind: "priority",
    validate: (v) => ["low", "med", "high"].includes(v), // others stay plain text
  }),
)
```

- Default parser of `CaptureInput` is `tagParser` (`#` → kind `tag`).
- `createPrefixParser` options: `trigger`, `kind`, `quotable` (default on),
  `isValueChar`, `validate`. `validate` only applies once a token is complete,
  so suggestions still show while typing.
- Your own parser can be any function with the `CaptureParser` signature
  (dates, `key:value`, …). Return tokens with `start`/`end` offsets.
- `composeParsers` resolves overlaps: earlier start wins, then parser order.

## Sources

```tsx
sources={{
  tag: captureSource({
    items: tags,
    getLabel: (t) => t.title,
    onCreate: (name) => createTag(name),   // optional → shows a "Create" row
  }),
  project: captureSource({
    items: projects,
    getLabel: (p) => p.name,
    onCreate: (name) => { goToAddProject(name); return false }, // false: leave the text alone
  }),
}}
```

A kind without a source is highlighted but has no popup. Other options per
source: `getKey`, `filter`, `renderItem`, `serialize`, `onSelect`,
`getCreateLabel`, `maxItems`.

`onCreate` fires when the "Create" row is picked; the typed text stays as it is
(your submit handler resolves tokens to rows by label). It does not wait for
promises. Return `false` synchronously to leave the text untouched — useful
when creating means navigating elsewhere.

Resolving at submit:

```ts
const { value, tokens } = extractCapture(raw, parser)
const { tag = [] } = groupTokenValues(tokens)          // unique, case-insensitive
const projectName = groupTokenValues(tokens).project?.[0]
const project = projects.find((p) => p.name.toLowerCase() === projectName?.toLowerCase())
```

## Keyboard

| Key | When the popup is open |
| --- | --- |
| ↑ / ↓ | highlight a suggestion |
| Enter | pick the highlighted suggestion; **submits the form if none is highlighted** |
| Tab | accept the highlighted suggestion, or the first real one. Never triggers "Create" |
| Esc | close; typing or refocusing reopens |

## Gotchas

- **Validate the extracted title, not the raw text.** `#errands` alone is a
  non-empty string. In the form: `validators.onSubmit` → run `extractCapture`
  and return `{ fields: { title: "…" } }` when `.value` is empty.
- **Highlight classes must not change glyph width.** The highlight is a mirror
  layer drawn over an input whose own text is transparent; padding, margins or bold on
  `tokenClassName` / `tokenClassNames` shift the text out of alignment. Colours,
  backgrounds and rounding are safe.
- **Metrics are read from the input at runtime** (font, padding, borders,
  letter spacing), so it follows whichever `Input` your design system ships.
  If you restyle the input after mount, a resize or font load re-syncs it.
- **`#` inside a longer word** is not a token (`issue#5`).
- Values containing `"` cannot be written back as quoted tokens.
- Needs the registry `combobox` item (Base UI) and `lucide-react`.

## Not covered

- Tokens in a `<textarea>` (multi-line) — the mirror assumes one line.
- Suggestion popup anchored at the caret rather than the input.
- IME composition is left to the browser; composition underlines are hidden
  because the input text is transparent.
