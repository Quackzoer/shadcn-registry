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
    > & {
      queryKey?: QueryKey;
    }
  ) => {
    const defaultQueryKeys = (typeof defaultOptions === "function" ? (defaultOptions(props).queryKey ?? []) : defaultOptions.queryKey ?? []);
    const optionsQueryKey = options?.queryKey ?? [];
    const queryKey = [...defaultQueryKeys, ...optionsQueryKey];
    return useQuery<TQueryFnData, Error, TData, QueryKey>({
      queryFn: () => queryFn(props),
      ...(typeof defaultOptions === "function" ? defaultOptions(props) : defaultOptions),
      ...options,
      queryKey: queryKey,
    });
  };
}


