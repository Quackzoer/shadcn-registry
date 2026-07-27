/**
 * The demo store.
 *
 * Everything below is the wiring — and the wiring is almost entirely
 * generated. Compare against the equivalent hand-written zustand slice:
 * six state keys to declare and null out, six near-identical setters, and a
 * separate `useEffect` per query in every layout component.
 *
 * The order of this file matters, and is the one sharp edge of the API:
 *
 *   1. declare your getter/action signatures  (app/store-slice/types.ts)
 *   2. compose `AppStore` from them
 *   3. implement the slices, passing `AppStore` explicitly
 *
 * Steps 2 and 3 cannot be swapped. A slice whose getters read the whole store
 * needs `AppStore` to type `get`; if `AppStore` were in turn inferred from
 * that slice, the two definitions would reference each other and TypeScript
 * reports TS7022 / TS2456. Declaring the signatures first breaks the cycle.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createEntitySlice } from '@/registry/store-slice/lib/create-entity-slice';
import { createListSlice } from '@/registry/store-slice/lib/create-list-slice';
import type {
  DefineEntitySlice,
  ListSlice,
} from '@/registry/store-slice/types/slice';
import type { CrmActions, CrmGetters, CrmMeta, SurveyMeta } from './types';

// ─── 2. Compose the store type — state and setters are derived, never typed ──

export type AppStore = DefineEntitySlice<
  'crm',
  CrmMeta,
  { getters: CrmGetters; actions: CrmActions }
> &
  ListSlice<'crm', CrmMeta, number> &
  // A minimal entity needs nothing but its name and data type.
  DefineEntitySlice<'survey', SurveyMeta>;

// ─── 3. Implement ────────────────────────────────────────────────────────────

const createCrmSlice = createEntitySlice<CrmMeta>()<
  'crm',
  AppStore,
  CrmGetters,
  CrmActions
>('crm', {
  getters: (get) => ({
    systemLabel: () => get().crm_data?.crmSystem.toUpperCase(),
    configurationForSurvey: () => {
      const { crm_data, survey_data } = get();
      if (!crm_data) return undefined;
      return { ...crm_data.configuration, survey: survey_data?.title };
    },
  }),

  actions: (_set, get) => ({
    adoptSelectedAsMain: () => {
      const selected = get().crmListGetters.getSelected();
      if (selected) get().crmSetters.setData(selected);
    },
  }),

  // Setters are generated, but any one of them can be overridden. `defaults`
  // is passed in so an override decorates rather than reimplements.
  setters: (_set, get, defaults) => ({
    setData: (data) => {
      defaults.setData(data);
      if (data) get().crmListSetters.upsertById(data);
    },
  }),
});

/**
 * The list slice for the same entity name. Adds `crm_list`, the six list
 * status keys, `crm_selectedId`, `crmListSetters` and `crmListGetters` —
 * none of which collide with the single-entity keys above.
 */
const createCrmListSlice = createListSlice<CrmMeta, number>()<'crm', AppStore>(
  'crm'
);

/** One line, and it still gets full state, setters and `syncQuery`. */
const createSurveySlice = createEntitySlice<SurveyMeta>()<'survey', AppStore>(
  'survey'
);

// ─── 4. Compose ──────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...createCrmSlice(set, get),
      ...createCrmListSlice(set, get),
      ...createSurveySlice(set, get),
    }),
    {
      name: 'store-slice-demo',
      // State keys are flat and prefixed, so `partialize` can cherry-pick a
      // single field without reconstructing a nested shape. Persist ids and
      // data — never `error`, which does not survive JSON.stringify.
      partialize: (state) => ({ crm_selectedId: state.crm_selectedId }),
    }
  )
);
