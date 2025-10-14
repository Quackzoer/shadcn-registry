import { useQuery, UseQueryOptions } from "@tanstack/react-query";

interface ExampleQueryFnProps {
  page: number;
}

const exampleQueryFn = async ({ page }: ExampleQueryFnProps) => {
  return {
    a: 1,
    b: 2,
    c: [1, 2, 3],
  };
};

export function useQueryExample<TData = Awaited<ReturnType<typeof exampleQueryFn>>>(
  { page }: ExampleQueryFnProps,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof exampleQueryFn>>, Error, TData, string[]>,
    "queryKey" 
    | "queryFn"
  >
) {
  return useQuery<Awaited<ReturnType<typeof exampleQueryFn>>, Error, TData, string[]>({
    queryKey: ["example", page.toString()],
    queryFn: async () => await exampleQueryFn({ page }),
    ...options,
  });
}

export function useQueryExampleCLengthSelector(props: ExampleQueryFnProps) {
  return useQueryExample(props, {
    select: (data) => data.c.length,
  });
}
