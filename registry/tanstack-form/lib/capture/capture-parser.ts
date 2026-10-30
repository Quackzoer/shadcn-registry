/**
 * Pure token parsing for quick-capture inputs ("Buy milk #errands @home !high").
 *
 * No React, no DOM, no app code. A parser is just a function from text to
 * tokens; the capture input derives everything else from that one result:
 * highlighting (segments), the clean value (extract) and the token under the
 * caret (suggestions).
 */

export interface CaptureToken<K extends string = string> {
  /** What the token means, e.g. `tag`, `project`, `priority`. */
  kind: K
  /** The character(s) that opened it, e.g. `#`. */
  trigger: string
  /** Text after the trigger. For quoted tokens, the text between the quotes. */
  value: string
  /** Exact source text, e.g. `#errands` or `@"My project"`. */
  raw: string
  /** Start offset in the source text (index of the trigger). */
  start: number
  /** End offset in the source text, exclusive. */
  end: number
  /**
   * The token is closed: followed by a terminator (whitespace by default), or
   * by its closing quote. In `final` mode every token is complete.
   */
  complete: boolean
  /** Written as `@"two words"`. */
  quoted: boolean
}

export interface CaptureParseOptions {
  /**
   * Treat the end of the text as a terminator. Used when the text is submitted:
   * "Buy milk #errands" then yields a complete `errands` tag.
   */
  final?: boolean
}

export type CaptureParser<K extends string = string> = (
  text: string,
  options?: CaptureParseOptions,
) => CaptureToken<K>[]

export interface CaptureResult<K extends string = string> {
  /** The text with every token removed and the gaps closed up. */
  value: string
  tokens: CaptureToken<K>[]
  /** The text as typed. */
  raw: string
}

export type CaptureSegment<K extends string = string> =
  | { type: "text"; text: string; start: number; end: number }
  | { type: "token"; text: string; start: number; end: number; token: CaptureToken<K> }

const isWhitespace = (char: string | undefined) => char !== undefined && /\s/.test(char)

export interface PrefixParserOptions<K extends string> {
  /** What opens a token: `#`, `@`, `!`, `/`, `::` … A token only starts at the beginning of the text or after whitespace, so `C#`, `a@b.com` and `Wow!` are left alone. */
  trigger: string
  kind: K
  /** Allow `@"two words"`. Default `true`. */
  quotable?: boolean
  /** Which characters may appear in an unquoted value. Default: anything that is not whitespace. */
  isValueChar?: (char: string) => boolean
  /**
   * Reject values that do not fit, e.g. only `low | med | high` for a priority.
   * Applied once the token is complete; while it is still being typed it is
   * always returned so suggestions can appear. Rejected tokens stay plain text.
   */
  validate?: (value: string) => boolean
}

/** Builds a parser for one `<trigger>value` syntax. */
export function createPrefixParser<K extends string>({
  trigger,
  kind,
  quotable = true,
  isValueChar = (char) => !isWhitespace(char),
  validate,
}: PrefixParserOptions<K>): CaptureParser<K> {
  if (!trigger) throw new Error("createPrefixParser: `trigger` must not be empty")

  return (text, { final = false } = {}) => {
    const tokens: CaptureToken<K>[] = []
    let i = 0

    while (i < text.length) {
      const startsHere = text.startsWith(trigger, i) && (i === 0 || isWhitespace(text[i - 1]))
      if (!startsHere) {
        i++
        continue
      }

      const valueStart = i + trigger.length
      let value: string
      let end: number
      let complete: boolean
      let quoted = false

      if (quotable && text[valueStart] === '"') {
        quoted = true
        const close = text.indexOf('"', valueStart + 1)
        if (close === -1) {
          value = text.slice(valueStart + 1)
          end = text.length
          complete = final
        } else {
          value = text.slice(valueStart + 1, close)
          end = close + 1
          complete = true
        }
      } else {
        let j = valueStart
        while (j < text.length && isValueChar(text[j])) j++
        value = text.slice(valueStart, j)
        end = j
        complete = j < text.length || final
      }

      const rejected =
        value === ""
          ? complete // a bare trigger only counts while it is being typed
          : complete && validate !== undefined && !validate(value)

      if (!rejected) {
        tokens.push({
          kind,
          trigger,
          value,
          raw: text.slice(i, end),
          start: i,
          end,
          complete,
          quoted,
        })
      }
      i = Math.max(end, i + 1)
    }

    return tokens
  }
}

type KindOf<P> = P extends CaptureParser<infer K> ? K : never

/**
 * Combines parsers into one. When two tokens overlap, the one that starts
 * first wins; on a tie, the parser listed first.
 */
export function composeParsers<P extends CaptureParser<any>[]>(
  ...parsers: P
): CaptureParser<KindOf<P[number]>> {
  return (text, options) => {
    const all = parsers.flatMap((parser) => parser(text, options)).sort((a, b) => a.start - b.start)
    const result: CaptureToken<KindOf<P[number]>>[] = []
    let cursor = 0
    for (const token of all) {
      if (token.start < cursor) continue
      result.push(token)
      cursor = token.end
    }
    return result
  }
}

/**
 * Parses `text` as if it were being submitted: the end of the text terminates
 * the last token, and a bare trigger stays plain text.
 */
export function extractCapture<K extends string>(
  text: string,
  parser: CaptureParser<K>,
): CaptureResult<K> {
  const tokens = parser(text, { final: true })
  const pieces: string[] = []
  let cursor = 0
  for (const token of tokens) {
    pieces.push(text.slice(cursor, token.start))
    cursor = token.end
  }
  pieces.push(text.slice(cursor))
  const value = pieces
    .map((piece) => piece.trim())
    .filter(Boolean)
    .join(" ")
  return { value, tokens, raw: text }
}

/**
 * Token values grouped by kind, in order, without repeats (case-insensitive,
 * first spelling wins): `{ tag: ["errands", "home"], project: ["Website"] }`.
 */
export function groupTokenValues<K extends string>(
  tokens: readonly CaptureToken<K>[],
): Partial<Record<K, string[]>> {
  const grouped: Partial<Record<K, string[]>> = {}
  for (const token of tokens) {
    const list = (grouped[token.kind] ??= [])
    if (!list.some((existing) => existing.toLowerCase() === token.value.toLowerCase())) {
      list.push(token.value)
    }
  }
  return grouped
}

/** Splits `text` into plain and token runs, for rendering highlights. */
export function segmentCapture<K extends string>(
  text: string,
  tokens: readonly CaptureToken<K>[],
): CaptureSegment<K>[] {
  const segments: CaptureSegment<K>[] = []
  let cursor = 0
  for (const token of tokens) {
    if (token.start > cursor) {
      segments.push({ type: "text", text: text.slice(cursor, token.start), start: cursor, end: token.start })
    }
    segments.push({ type: "token", text: token.raw, start: token.start, end: token.end, token })
    cursor = token.end
  }
  if (cursor < text.length) {
    segments.push({ type: "text", text: text.slice(cursor), start: cursor, end: text.length })
  }
  return segments
}

/** Offset where the token's value begins (after the trigger and an opening quote). */
export const tokenValueStart = (token: CaptureToken) =>
  token.start + token.trigger.length + (token.quoted ? 1 : 0)

/** The token the caret is editing, if any. */
export function findActiveToken<K extends string>(
  tokens: readonly CaptureToken<K>[],
  caret: number,
): CaptureToken<K> | undefined {
  return tokens.find((token) => {
    const from = token.start + token.trigger.length
    // A closed quoted token is only being edited from inside the quotes.
    return token.quoted && token.complete
      ? caret > from && caret < token.end
      : caret >= from && caret <= token.end
  })
}

/** Writes a value back as token text, quoting it when it contains whitespace. */
export function formatToken(trigger: string, value: string): string {
  return /\s/.test(value) ? `${trigger}"${value}"` : `${trigger}${value}`
}

/** `#` → tags. The default parser of the capture input. */
export const tagParser = createPrefixParser({ trigger: "#", kind: "tag" })
/** `@` → project. Quote names with spaces: `@"Home reno"`. */
export const projectParser = createPrefixParser({ trigger: "@", kind: "project" })
/** `!` → priority. Pass your own `validate` via `createPrefixParser` to restrict the values. */
export const priorityParser = createPrefixParser({ trigger: "!", kind: "priority" })

export const defaultCaptureParser = tagParser
