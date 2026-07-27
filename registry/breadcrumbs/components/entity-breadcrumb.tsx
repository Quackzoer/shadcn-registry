'use client'

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { ReactNode, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

import type { RouterAdapter } from '../types/router-adapter'

export interface BreadcrumbEntity {
  name: string
  id: string
  url: string
  icon?: ReactNode
}

export interface EntityBreadcrumbProps {
  label: string
  entities: Array<BreadcrumbEntity>
  currentlySelectedId: string
  isLoading?: boolean
  /** Same adapter you passed to `createBreadcrumbs`. */
  Link: RouterAdapter['Link']
}

/**
 * A breadcrumb segment that is also a switcher — it names the current entity
 * and opens a searchable list of its siblings.
 *
 * Wrap it per entity type in your app to supply `entities` from wherever that
 * list lives:
 *
 * ```tsx
 * export function ProjectBreadcrumb() {
 *   const { projectId } = useParams()
 *   const projects = useAppStore((s) => s.project_list) ?? []
 *   return (
 *     <EntityBreadcrumb
 *       label="Project"
 *       currentlySelectedId={projectId ?? ''}
 *       entities={projects.map((p) => ({
 *         id: String(p.id),
 *         name: p.name,
 *         url: `/project/${p.id}`,
 *       }))}
 *     />
 *   )
 * }
 * ```
 */
export function EntityBreadcrumb({
  entities,
  label,
  currentlySelectedId,
  isLoading,
  Link,
}: Readonly<EntityBreadcrumbProps>) {
  const [open, setOpen] = useState(false)

  const selected = entities.find((e) => e.id === currentlySelectedId)
  // Selected entity floated to the top so the current item is always the first
  // thing under the cursor when the list opens.
  const ordered = entities.toSorted((a) =>
    a.id === currentlySelectedId ? -1 : 1
  )

  return (
    <div className="flex flex-col gap-1">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      {isLoading ? (
        <Button variant="outline" className="justify-between" size="sm" disabled>
          <Spinner />
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between"
              size="sm"
            >
              {selected?.icon}
              <span className="truncate">{selected?.name}</span>
              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Command>
              <CommandInput
                placeholder={`Search for ${label.toLowerCase()}...`}
                className="h-8"
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {ordered.map((item) => (
                    // value includes the id so two entities with the same name
                    // remain independently selectable in the filter.
                    <CommandItem
                      key={item.id}
                      value={`${item.name}-${item.id}`}
                      asChild
                    >
                      <Link
                        href={item.url}
                        onClick={() => setOpen(false)}
                        className="flex gap-1 text-xs"
                      >
                        {item.icon}
                        {item.name}
                        <CheckIcon
                          className={cn(
                            'ml-auto h-4 w-4',
                            item.id === currentlySelectedId
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </Link>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
