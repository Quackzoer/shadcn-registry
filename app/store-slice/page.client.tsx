'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSyncQuery } from '@/registry/store-slice/hooks/use-sync-query';

import { useAppStore } from './store';
import type { CrmMeta } from './types';

// ─── Fake backend ────────────────────────────────────────────────────────────

const CRMS: CrmMeta[] = [
  { id: 1, name: 'Acme', crmSystem: 'hubspot', configuration: { region: 'eu' } },
  { id: 2, name: 'Globex', crmSystem: 'salesforce', configuration: { region: 'us' } },
  { id: 3, name: 'Initech', crmSystem: 'airtable', configuration: { region: 'apac' } },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const fetchCrmList = async () => {
  await delay(600);
  return CRMS;
};

const fetchCrmById = async (id: number) => {
  await delay(600);
  const found = CRMS.find((crm) => crm.id === id);
  if (!found) throw new Error(`No CRM with id ${id}`);
  return found;
};

// ─── Demo ────────────────────────────────────────────────────────────────────

export default function PageClient() {
  const [crmId, setCrmId] = useState(1);

  // The whole component-side integration: one line per query. Both the entity
  // and the list mirror every field — data, error, and all five status flags.
  useSyncQuery(
    useQuery({ queryKey: ['crm', crmId], queryFn: () => fetchCrmById(crmId) }),
    useAppStore((s) => s.crmSetters.syncQuery)
  );

  useSyncQuery(
    useQuery({ queryKey: ['crm', 'list'], queryFn: fetchCrmList }),
    useAppStore((s) => s.crmListSetters.syncListQuery)
  );

  return (
    <div className="mx-auto flex min-h-svh max-w-4xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">store-slice</h1>
        <p className="text-muted-foreground">
          Composable zustand slices that mirror TanStack Query. Every panel
          below reads generated state — none of it was written by hand.
        </p>
      </header>

      <EntityPanel crmId={crmId} onSelect={setCrmId} />
      <ListPanel />
      <DerivedPanel />
    </div>
  );
}

function EntityPanel({
  crmId,
  onSelect,
}: {
  crmId: number;
  onSelect: (id: number) => void;
}) {
  // Raw selectors on flat prefixed keys. `??` is needed because uninitialized
  // fields read `undefined` — "never observed" rather than a fabricated false.
  const data = useAppStore((s) => s.crm_data);
  const isLoading = useAppStore((s) => s.crm_isLoading) ?? false;
  const isFetching = useAppStore((s) => s.crm_isFetching) ?? false;
  const error = useAppStore((s) => s.crm_error);
  const { patchData, reset } = useAppStore((s) => s.crmSetters);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entity slice</CardTitle>
        <CardDescription>
          <code>crm_data</code>, <code>crm_isLoading</code>,{' '}
          <code>crm_error</code> and four more keys, all mirrored by a single{' '}
          <code>syncQuery</code> call.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {CRMS.map((crm) => (
            <Button
              key={crm.id}
              size="sm"
              variant={crm.id === crmId ? 'default' : 'outline'}
              onClick={() => onSelect(crm.id)}
            >
              Load {crm.name}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <StatusBadge label="isLoading" value={isLoading} />
          <StatusBadge label="isFetching" value={isFetching} />
          {error ? (
            <Badge variant="destructive">error: {error.message}</Badge>
          ) : null}
        </div>

        <StateBlock value={data} fallback="undefined — query not yet observed" />

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => patchData({ name: `${data?.name ?? ''} (edited)` })}
          >
            patchData — optimistic rename
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ListPanel() {
  const list = useAppStore((s) => s.crm_list) ?? [];
  const isListLoading = useAppStore((s) => s.crm_isListLoading) ?? false;
  const selectedId = useAppStore((s) => s.crm_selectedId);
  const { setSelectedId, updateById, removeById } = useAppStore(
    (s) => s.crmListSetters
  );
  const adoptSelectedAsMain = useAppStore(
    (s) => s.crmActions.adoptSelectedAsMain
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>List slice</CardTitle>
        <CardDescription>
          Same <code>crm</code> prefix, different keys — so the collection&apos;s
          loading state and the main entity&apos;s loading state stay
          independently observable. Editing a member never touches{' '}
          <code>crm_data</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <StatusBadge label="isListLoading" value={isListLoading} />

        <ul className="flex flex-col gap-2">
          {list.map((crm) => (
            <li
              key={crm.id}
              className="flex flex-wrap items-center gap-2 rounded-md border p-2"
            >
              <span className="font-medium">{crm.name}</span>
              <Badge variant="outline">{crm.crmSystem}</Badge>
              {crm.id === selectedId ? <Badge>selected</Badge> : null}
              <div className="ml-auto flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedId(crm.id)}
                >
                  select
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateById(crm.id, { name: `${crm.name}*` })}
                >
                  updateById
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeById(crm.id)}
                >
                  removeById
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <Separator />

        <Button
          size="sm"
          variant="secondary"
          className="self-start"
          onClick={adoptSelectedAsMain}
        >
          crmActions.adoptSelectedAsMain — promote selection to crm_data
        </Button>
      </CardContent>
    </Card>
  );
}

function DerivedPanel() {
  const systemLabel = useAppStore((s) => s.crmGetters.systemLabel);
  const configurationForSurvey = useAppStore(
    (s) => s.crmGetters.configurationForSurvey
  );
  const setSurveyData = useAppStore((s) => s.surveySetters.setData);
  const survey = useAppStore((s) => s.survey_data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Getters</CardTitle>
        <CardDescription>
          Getters receive the store&apos;s <code>get</code>, so they can derive
          across slices — this one reads <code>crm</code> and{' '}
          <code>survey</code> together.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          size="sm"
          variant="outline"
          className="self-start"
          onClick={() =>
            setSurveyData(
              survey ? undefined : { id: 9, title: 'NPS Q1' }
            )
          }
        >
          {survey ? 'Clear survey_data' : 'Set survey_data'}
        </Button>

        <div className="text-sm">
          <code>systemLabel()</code> → {systemLabel() ?? 'undefined'}
        </div>
        <StateBlock
          value={configurationForSurvey()}
          fallback="undefined — no crm_data yet"
        />
      </CardContent>
    </Card>
  );
}

// ─── Small presentational helpers ────────────────────────────────────────────

function StatusBadge({ label, value }: { label: string; value: boolean }) {
  return (
    <Badge variant={value ? 'default' : 'outline'}>
      {label}: {String(value)}
    </Badge>
  );
}

function StateBlock({
  value,
  fallback,
}: {
  value: unknown;
  fallback: string;
}) {
  return (
    <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
      {value === undefined ? fallback : JSON.stringify(value, null, 2)}
    </pre>
  );
}
