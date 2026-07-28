import {
  type QueryCondition,
  type QueryFieldSchema,
  type QueryOperator,
  DEFAULT_OPERATORS,
} from "@/registry/query-builder/types/query-builder";

function splitRespectingQuotes(input: string): string[] {
  const segments: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "'" || ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      segments.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  segments.push(current);
  return segments;
}

function stripQuotes(s: string): string {
  const trimmed = s.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function getOperators(
  fieldSchema: QueryFieldSchema | undefined,
): QueryOperator[] {
  if (!fieldSchema) return DEFAULT_OPERATORS.string;
  return fieldSchema.operators ?? DEFAULT_OPERATORS[fieldSchema.type];
}

function parseValue(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  return stripQuotes(trimmed);
}

export function parseQuery(
  query: string,
  schema: readonly QueryFieldSchema[],
): QueryCondition[] {
  if (!query.trim()) return [];

  const segments = splitRespectingQuotes(query).map((s) => s.trim());
  const conditions: QueryCondition[] = [];

  let i = 0;
  while (i < segments.length) {
    const fieldRaw = segments[i]?.trim() ?? "";
    const fieldSchema = schema.find((f) => f.name === fieldRaw);

    if (!fieldSchema) {
      i++;
      continue;
    }

    const operators = getOperators(fieldSchema);
    const operatorRaw = segments[i + 1]?.trim() ?? "";
    const operator = operators.find((op) => op === operatorRaw);

    if (!operator) {
      i++;
      continue;
    }

    const needsValue = !["is_null", "is_not_null"].includes(operator);
    const value = needsValue ? parseValue(segments[i + 2] ?? "") : undefined;

    conditions.push({ field: fieldRaw, operator, value });
    i += needsValue ? 3 : 2;
  }

  return conditions;
}

export function toQueryString(conditions: QueryCondition[]): string {
  return conditions
    .map((c) => {
      if (["is_null", "is_not_null"].includes(c.operator)) {
        return `${c.field},${c.operator}`;
      }
      const needsQuoting = c.value?.includes(",") ?? false;
      const value = needsQuoting ? `'${c.value}'` : c.value ?? "";
      return `${c.field},${c.operator},${value}`;
    })
    .join(", ");
}

export function getFieldSchema(
  schema: readonly QueryFieldSchema[],
  fieldName: string,
): QueryFieldSchema | undefined {
  return schema.find((f) => f.name === fieldName);
}

export function getOperatorsForField(
  schema: readonly QueryFieldSchema[],
  fieldName: string,
): QueryOperator[] {
  return getOperators(getFieldSchema(schema, fieldName));
}

export function needsValue(operator: QueryOperator): boolean {
  return !["is_null", "is_not_null"].includes(operator);
}
