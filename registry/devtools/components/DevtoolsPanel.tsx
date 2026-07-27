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
import type { DevtoolsConfig } from "@/registry/devtools/types/devtools";

export function DevtoolsPanel({
  position = "bottom",
  theme = "auto",
}: Pick<DevtoolsConfig, "position" | "theme">) {
  const { isOpen, setIsOpen, plugins, activeTab, setActiveTab } =
    useDevtools();

  const isDark = theme === "dark" || theme === "auto";

  if (plugins.length === 0) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
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

  const activePlugin = plugins.find((p) => p.id === activeTab);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="max-h-[50vh]">
        <DrawerHeader>
          <DrawerTitle>DevTools</DrawerTitle>
        </DrawerHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full px-4 pb-4"
        >
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${plugins.length}, minmax(0, 1fr))` }}>
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
              <div className="max-h-[calc(50vh-120px)] overflow-auto">
                <plugin.component isDark={isDark} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
