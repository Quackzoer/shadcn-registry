// ---------------------------------------------------------------------------
// Schema — pluggable field + operator definitions
// ---------------------------------------------------------------------------

export type QueryFieldSchema = {
  name: string;
  label: string;
  type: string;
  description?: string;
  operators: string[];
  options?: readonly string[];
};

// ---------------------------------------------------------------------------
// Conditions
// ---------------------------------------------------------------------------

export interface QueryCondition {
  field: string;
  operator: string;
  value?: string;
}

// ---------------------------------------------------------------------------
// Null-checking — which operators require no value
// ---------------------------------------------------------------------------

export const NULL_OPERATORS = new Set([
  "is_null",
  "is_not_null",
  "is_empty",
  "is_not_empty",
  "is_true",
  "is_false",
]);

// ---------------------------------------------------------------------------
// Defaults — users spread / override these when building their schema
// ---------------------------------------------------------------------------

export const DEFAULT_OPERATORS: Record<string, string[]> = {
  string: [
    "eq",
    "neq",
    "contains",
    "starts_with",
    "ends_with",
    "is_null",
    "is_not_null",
  ],
  number: ["eq", "neq", "gt", "gte", "lt", "lte", "is_null", "is_not_null"],
  boolean: ["eq", "is_true", "is_false"],
  date: ["eq", "neq", "gt", "gte", "lt", "lte", "is_null", "is_not_null"],
};

export const OPERATOR_LABELS: Record<string, string> = {
  eq: "equals",
  neq: "not equals",
  gt: "greater than",
  gte: "greater or equal",
  lt: "less than",
  lte: "less or equal",
  contains: "contains",
  starts_with: "starts with",
  ends_with: "ends with",
  in: "in",
  not_in: "not in",
  is_null: "is empty",
  is_not_null: "is not empty",
  is_true: "is true",
  is_false: "is false",
};

// ---------------------------------------------------------------------------
// Resolver — single function that handles all operators
// ---------------------------------------------------------------------------

export type QueryResolver<TData> = (
  field: string,
  operator: string,
  value: string | undefined,
) => (item: TData) => boolean;

// ---------------------------------------------------------------------------
// useQueryFilter hook props
// ---------------------------------------------------------------------------

export interface UseQueryFilterProps<TData> {
  conditions: QueryCondition[];
  schema: readonly QueryFieldSchema[];
  resolver: QueryResolver<TData>;
  data: readonly TData[];
}

// ---------------------------------------------------------------------------
// useQueryFilter return
// ---------------------------------------------------------------------------

export interface UseQueryFilterReturn<TData> {
  filtered: TData[];
  count: number;
}

// ---------------------------------------------------------------------------
// Styling — per-part className callbacks
// ---------------------------------------------------------------------------

export interface QueryBuilderStyling {
  className?: string;
  wrapperClassName?: string | ((ctx: { className?: string }) => string);
  entityChipClassName?:
    | string
    | ((ctx: {
        field: string;
        fieldSchema: QueryFieldSchema | undefined;
        className?: string;
      }) => string);
  operatorChipClassName?:
    | string
    | ((ctx: {
        operator: string;
        label: string;
        className?: string;
      }) => string);
  valueChipClassName?:
    | string
    | ((ctx: { value: string; className?: string }) => string);
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface QueryBuilderProps<
  TData = unknown,
> extends QueryBuilderStyling {
  schema: readonly QueryFieldSchema[];
  conditions?: QueryCondition[];
  onConditionsChange?: (conditions: QueryCondition[]) => void;
  placeholder?: string;

  /** Per-type transform callbacks — user provides e.g. { age: (ctx) => ctx.user.age } */
  typeResolvers?: Record<string, (ctx: unknown) => unknown>;

  /** Server or client resolver that evaluates a single condition against data */
  resolver: QueryResolver<TData>;

  /** Dataset to filter */
  data: readonly TData[];

  /** Returns the filtered dataset. Used internally and exposed to child render prop. */
  useQueryFilter?: (
    props: UseQueryFilterProps<TData>,
  ) => UseQueryFilterReturn<TData>;

  children?: (props: {
    entity: (field: string) => React.ReactNode;
    operator: (op: string) => React.ReactNode;
    value: (val: string) => React.ReactNode;
    getFilteredData: () => TData[];
    conditions: QueryCondition[];
    setConditions: (conditions: QueryCondition[]) => void;
  }) => React.ReactNode;
  renderEntityChip?: (props: {
    field: string;
    fieldSchema: QueryFieldSchema | undefined;
  }) => React.ReactNode;
  renderOperatorChip?: (props: {
    operator: string;
    label: string;
  }) => React.ReactNode;
  renderValueChip?: (props: {
    value: string;
  }) => React.ReactNode;
}
