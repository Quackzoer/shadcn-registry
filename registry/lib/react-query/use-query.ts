import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";

/**
 * Factory function to create typed useQuery hooks with automatic type inference
 */
export function createUseQuery<TQueryFnData, TProps = void>(
  queryFn: (props: TProps) => Promise<TQueryFnData>,
  defaultOptions:
    | ((
        props: TProps
      ) => Omit<
        UseQueryOptions<TQueryFnData, Error, TQueryFnData, QueryKey>,
        "queryFn" | "select"
      >)
    | Omit<
        UseQueryOptions<TQueryFnData, Error, TQueryFnData, QueryKey>,
        "queryFn"
      >
) {
  return <TData = TQueryFnData>(
    ...args: TProps extends void
      ? [
          config?: {
            props?: void;
            options?: Omit<
              UseQueryOptions<TQueryFnData, Error, TData, QueryKey>,
              "queryKey" | "queryFn"
            > & {
              queryKey?: QueryKey;
            };
          }
        ]
      : [
          config: {
            props: TProps;
            options?: Omit<
              UseQueryOptions<TQueryFnData, Error, TData, QueryKey>,
              "queryKey" | "queryFn"
            > & {
              queryKey?: QueryKey;
            };
          }
        ]
  ) => {
    const { props, options } = args[0] ?? {};
    const defaultQueryKeys =
      typeof defaultOptions === "function"
        ? defaultOptions(props as TProps).queryKey ?? []
        : defaultOptions.queryKey ?? [];
    const optionsQueryKey = options?.queryKey ?? [];
    const queryKey = [...defaultQueryKeys, ...optionsQueryKey];
    return useQuery<TQueryFnData, Error, TData, QueryKey>({
      queryFn: () => queryFn(props as TProps),
      ...(typeof defaultOptions === "function"
        ? defaultOptions(props as TProps)
        : defaultOptions),
      ...options,
      queryKey: queryKey,
    });
  };
}
