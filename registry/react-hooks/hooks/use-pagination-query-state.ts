import { parseAsIndex, parseAsInteger, useQueryStates } from 'nuqs'

export interface PaginationDefaults {
  pageIndex: number
  pageSize: number
}

/**
 * Pagination state stored in the URL rather than component state, so a paged
 * view survives reload and can be shared or linked to.
 *
 * `parseAsIndex` is deliberate: the URL shows a 1-based `?page=1` while the
 * value you read stays 0-based, which is what TanStack Table and most
 * pagination APIs expect.
 *
 * The URL keys are `page` and `perPage`; the state keys are `pageIndex` and
 * `pageSize`, so it drops straight into a TanStack Table `pagination` state.
 */
export function usePaginationQueryState(
  defaultValues: PaginationDefaults = { pageIndex: 0, pageSize: 10 }
) {
  return useQueryStates(
    {
      pageIndex: parseAsIndex.withDefault(defaultValues.pageIndex),
      pageSize: parseAsInteger.withDefault(defaultValues.pageSize),
    },
    {
      urlKeys: { pageIndex: 'page', pageSize: 'perPage' },
    }
  )
}
