import { useQuery, UseQueryOptions } from "@tanstack/react-query";

interface ExampleQueryFnProps {
  page: number;
}

const exampleQueryFn = async ({ page }: ExampleQueryFnProps) => {
  return {
    a: 1,
    b: 2,
    c: [
        1,2,3
    ]
  };
};

export function useQueryExample({page}: ExampleQueryFnProps, options) {
  return useQuery({
    queryFn: async () => await exampleQueryFn({page}),
    queryKey: ["example"],
  });
}

export function useQueryExampleCLengthSelector (props: ExampleQueryFnProps) {
  return useQueryExample(props, {
    select: (data) => data.c.length
  });
}
