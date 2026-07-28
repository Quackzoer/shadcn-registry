export type QueryFieldType = "string" | "number" | "boolean" | "date";

export type QueryOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "starts_with"
  | "ends_with"
  | "in"
  | "not_in"
  | "is_null"
  | "is_not_null";

export interface QueryFieldSchema {
  name: string;
  label: string;
  type: QueryFieldType;
  description?: string;
  operators?: QueryOperator[];
  options?: readonly string[];
}

export interface QueryCondition {
  field: string;
  operator: QueryOperator;
  value?: string;
}

export interface QueryBuilderState {
  conditions: QueryCondition[];
  draft: string;
}

export interface QueryBuilderProps {
  schema: readonly QueryFieldSchema[];
  value?: string;
  onChange?: (query: string) => void;
  conditions?: QueryCondition[];
  onConditionsChange?: (conditions: QueryCondition[]) => void;
  onSubmit?: (conditions: QueryCondition[]) => void;
  multi?: boolean;
  placeholder?: string;
  className?: string;
}

export const DEFAULT_OPERATORS: Record<QueryFieldType, QueryOperator[]> = {
  string: ["eq", "neq", "contains", "starts_with", "ends_with", "is_null", "is_not_null"],
  number: ["eq", "neq", "gt", "gte", "lt", "lte", "is_null", "is_not_null"],
  boolean: ["eq"],
  date: ["eq", "neq", "gt", "gte", "lt", "lte", "is_null", "is_not_null"],
};

export const OPERATOR_LABELS: Record<QueryOperator, string> = {
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
};
