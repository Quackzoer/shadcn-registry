import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";

/**
 * Factory function to create typed useQuery hooks with automatic type inference
 */
export function createUseQuery<TQueryFnData, TProps = void>(
  queryFn: (props: TProps) => Promise<TQueryFnData>,
  defaultOptions: ((
    props: TProps
  ) =>
    Omit<
        UseQueryOptions<TQueryFnData, Error, TQueryFnData, QueryKey>,
        "queryFn" | "select"
      >) |  Omit<
        UseQueryOptions<TQueryFnData, Error, TQueryFnData, QueryKey>,
        "queryFn"
      >
) {
  return <TData = TQueryFnData>(
    props: TProps,
    options?: Omit<
      UseQueryOptions<TQueryFnData, Error, TData, QueryKey>,
      "queryKey" | "queryFn"
    >
  ) => {
    return useQuery<TQueryFnData, Error, TData, QueryKey>({
      queryFn: () => queryFn(props),
      ...(typeof defaultOptions === "function" ? defaultOptions(props) : defaultOptions),
      ...options,
    });
  };
}

interface ExampleQueryFnProps {
  page: number;
}

const exampleQueryFn = async ({}: ExampleQueryFnProps) => {
  return {
    a: 1,
    b: 2,
    c: [1, 2, 3],
  };
};

export const useQueryExample = createUseQuery(exampleQueryFn, ({ page }) => ({
  queryKey: ["example", page],
  enabled: page > 0,
}));

export function useQueryExampleCLengthSelector(props: ExampleQueryFnProps) {
  return useQueryExample(props, {
    select: (data) => data.c.length,
  });
}
