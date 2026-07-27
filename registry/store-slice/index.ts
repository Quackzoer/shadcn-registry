/**
 * store-slice — composable zustand slices that mirror TanStack Query.
 *
 * Single entry point, so consumers can `import { createEntitySlice, useSyncQuery }
 * from '@/lib/store-slice'` instead of reaching into subfolders.
 */

export * from './types/query-state';
export * from './types/slice';

export * from './lib/query-snapshot';
export * from './lib/create-entity-slice';
export * from './lib/create-list-slice';
export * from './lib/create-entity-access';

export * from './hooks/use-sync-query';
