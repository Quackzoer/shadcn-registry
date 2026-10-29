"use client";

import React from "react";
import { useDevtools } from "@/registry/devtools/lib/context";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DevtoolsConfig } from "@/registry/devtools/types/devtools";

export function DevtoolsPanel({
  position = "bottom",
  theme = "auto",
}: Pick<DevtoolsConfig, "position" | "theme">) {
  const { isOpen, setIsOpen, plugins, activeTab, setActiveTab, actions, statusBarItems } =
    useDevtools();

  const isDark = theme === "dark" || theme === "auto";

  const activeActions = activeTab
    ? actions.filter((a) => a.id.startsWith(`${activeTab}:`))
    : [];

  if (plugins.length === 0) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction={position}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>DevTools</DrawerTitle>
            <DrawerDescription>
              No plugins registered. Add plugins to get started.
            </DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction={position}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>DevTools</DrawerTitle>
        </DrawerHeader>

        {activeActions.length > 0 && (
          <>
            <div className="flex items-center gap-1 px-4 pb-2">
              {activeActions.map((action) => (
                <Tooltip key={action.id}>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={action.onClick}
                    >
                      {action.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {action.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
            <Separator />
          </>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full px-4 pb-4"
        >
          <TabsList
            className="grid w-full"
            style={{
              gridTemplateColumns: `repeat(${plugins.length}, minmax(0, 1fr))`,
            }}
          >
            {plugins.map((plugin) => (
              <TabsTrigger key={plugin.id} value={plugin.id}>
                <span className="flex items-center gap-2">
                  {plugin.icon}
                  {plugin.name}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {plugins.map((plugin) => (
            <TabsContent key={plugin.id} value={plugin.id} className="mt-4">
              <div className="max-h-[calc(50vh-160px)] overflow-auto">
                <plugin.component isDark={isDark} />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {statusBarItems.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center gap-3 px-4 py-1.5 text-xs text-muted-foreground">
              {statusBarItems.map((s) => (
                <span key={s.id}>{s.item}</span>
              ))}
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
