# Patterns — recipes for the common cases

Every snippet below is exercised by the live demo in `app/store-slice/` —
`types.ts` for the declarations, `store.ts` for the wiring, `page.client.tsx`
for the component side.

---

## Define a minimal entity

One line. You get all seven state keys and all ten setters.

```ts
const createSurveySlice = createEntitySlice<SurveyMeta>()<'survey', AppStore>('survey');
```

---

## Define an entity with derived reads

Declare the signatures, then implement. `get()` returns the whole store, which
is the reason getters live here rather than as free-standing selectors.

```ts
interface CrmGetters {
  systemLabel: () => string | undefined;
  configurationFor: (surveyTitle: string) => Record<string, unknown> | undefined;
}

const createCrmSlice = createEntitySlice<CrmMeta>()<'crm', AppStore, CrmGetters>('crm', {
  getters: (get) => ({
    systemLabel: () => get().crm_data?.crm_system.toUpperCase(),
    configurationFor: (surveyTitle) => {
      const { crm_data, survey_data } = get();          // cross-slice, fully typed
      if (!crm_data) return undefined;
      return { ...crm_data.configuration, survey: survey_data?.title ?? surveyTitle };
    },
  }),
});
```

Read them with `useAppStore(s => s.crmGetters.systemLabel)` and call the result.

---

## Add custom logic (actions)

Actions get both `set` and `get`. Use them for anything that is not a plain
field write.

```ts
interface CrmActions {
  adoptSelectedAsMain: () => void;
}

// inside createEntitySlice options:
actions: (_set, get) => ({
  adoptSelectedAsMain: () => {
    const selected = get().crmListGetters.getSelected();
    if (selected) get().crmSetters.setData(selected);
  },
}),
```

---

## Override one generated setter

Name only what you are changing. `defaults` lets you extend rather than
reimplement.

```ts
setters: (_set, get, defaults) => ({
  setData: (data) => {
    defaults.setData(data);
    if (data) get().crmListSetters.upsertById(data);   // keep the list in step
  },
}),
```

Everything you don't name keeps its generated implementation.

---

## Add a collection to an entity

```ts
const createCrmListSlice = createListSlice<CrmMeta, number>()<'crm', AppStore>('crm');
```

Adds `crm_list`, `crm_listError`, `crm_isListPending` / `_isListLoading` /
`_isListFetching` / `_isListError` / `_isListSuccess`, `crm_selectedId`, plus:

```ts
crmListSetters.syncListQuery(query)     // mirror a list-returning useQuery
crmListSetters.setSelectedId(2)
crmListSetters.updateById(2, { name })  // patch one member
crmListSetters.upsertById(item)         // replace by id, or append
crmListSetters.removeById(2)
crmListSetters.resetList()

crmListGetters.getById(2)               // CrmMeta | undefined
crmListGetters.getSelected()            // resolves crm_selectedId against the list
```

If the id is not on `item.id`, say so:

```ts
createListSlice<CrmConfigMeta, string>()<'crm_config', AppStore>('crm_config', {
  selectId: (config) => config.uuid,
});
```

---

## Mirror a query from a component

```ts
useSyncQuery(useGetCrmById(id), useAppStore(s => s.crmSetters.syncQuery));
useSyncQuery(useGetCrmsByOrgId(orgId), useAppStore(s => s.crmListSetters.syncListQuery));
```

To clear the entity when the layout unmounts:

```ts
useSyncQueryWithCleanup(
  useGetCrmById(id),
  useAppStore(s => s.crmSetters.syncQuery),
  useAppStore(s => s.crmSetters.reset),
);
```

---

## Read state in a component

Raw selectors work and remain the baseline:

```ts
const crm = useAppStore(s => s.crm_data);
const isLoading = useAppStore(s => s.crm_isLoading) ?? false;
```

Or bind the prefix once with `createEntityAccess`:

```ts
export const crm = createEntityAccess<CrmMeta>()(useAppStore, 'crm');

crm.useData()       // CrmMeta | undefined
crm.useIsLoading()  // boolean  (undefined coalesced to false)
crm.useError()      // Error | null
crm.useStatus()     // all five flags + error in one subscription
crm.useSetters()    // the whole setters object
crm.get()           // outside React
crm.set(next)       // outside React
```

`useStatus()` builds a fresh object each render — pair it with zustand's
`useShallow` if the extra renders show up in a profile.

---

## Operate on a list member without touching the main entity

This is the "select a different entity than `crm_data`" case:

```ts
const { setSelectedId, updateById, removeById } = useAppStore(s => s.crmListSetters);
const getSelected = useAppStore(s => s.crmListGetters.getSelected);

setSelectedId(crm.id);
updateById(crm.id, { name: 'Renamed' });   // crm_data is untouched
getSelected();                              // resolved from the list, never stale
```

Promote the selection to the main entity with an action
(`adoptSelectedAsMain` above) when you want the two to converge.

---

## Optimistic update

`patchData` shallow-merges and no-ops while data is unset, so it is safe to
call before the query has resolved:

```ts
const { patchData } = useAppStore(s => s.crmSetters);
patchData({ name: draftName });        // instant
await renameCrm(id, draftName);        // TanStack invalidation re-syncs the truth
```

---

## Mirror an additional query field app-wide

Add it in one place — `types/query-state.ts` and `lib/query-snapshot.ts`:

```ts
export type MirroredQueryField = 'data' | 'error' | /* … */ | 'isRefetching';

export const MIRRORED_QUERY_FIELDS = [
  'data', 'error', /* … */, 'isRefetching',
] as const satisfies readonly MirroredQueryField[];
```

Every entity in the app gains `{name}_isRefetching` and
`{name}Setters.setIsRefetching`, and `syncQuery` starts mirroring it. The
`satisfies` keeps the runtime array and the type union from diverging.

---

## Compose the store

```ts
export type AppStore =
  DefineEntitySlice<'crm', CrmMeta, { getters: CrmGetters; actions: CrmActions }> &
  ListSlice<'crm', CrmMeta, number> &
  DefineEntitySlice<'survey', SurveyMeta>;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...createCrmSlice(set, get),
      ...createCrmListSlice(set, get),
      ...createSurveySlice(set, get),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({ crm_selectedId: state.crm_selectedId }),
    }
  )
);
```

See `ARCHITECTURE.md` § 7 for why `AppStore` is declared before the creators
rather than inferred from them.
