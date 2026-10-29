"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type {
  DevtoolsContextType,
  DevtoolsPlugin,
  DevtoolsStatusBarItem,
  DevtoolsAction,
} from "@/registry/devtools/types/devtools";

const DevtoolsContext = createContext<DevtoolsContextType | undefined>(
  undefined
);

export function DevtoolsProvider({
  children,
  initialOpen = false,
}: {
  children: React.ReactNode;
  initialOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [plugins, setPlugins] = useState<DevtoolsPlugin[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [isDark, setIsDark] = useState(false);
  const [statusBarItems, setStatusBarItems] = useState<DevtoolsStatusBarItem[]>([]);
  const [actions, setActions] = useState<DevtoolsAction[]>([]);

  const registerPlugin = useCallback((plugin: DevtoolsPlugin) => {
    setPlugins((prev) => {
      const exists = prev.some((p) => p.id === plugin.id);
      if (exists) return prev;
      const updated = [...prev, plugin];
      updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return updated;
    });

    if (!activeTab && plugins.length === 0) {
      setActiveTab(plugin.id);
    }
  }, [activeTab, plugins.length]);

  const unregisterPlugin = useCallback((pluginId: string) => {
    setPlugins((prev) => prev.filter((p) => p.id !== pluginId));
    if (activeTab === pluginId) {
      setActiveTab("");
    }
  }, [activeTab]);

  const registerStatusBarItem = useCallback((item: DevtoolsStatusBarItem) => {
    setStatusBarItems((prev) => {
      if (prev.some((s) => s.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const unregisterStatusBarItem = useCallback((id: string) => {
    setStatusBarItems((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const registerAction = useCallback((action: DevtoolsAction) => {
    setActions((prev) => {
      if (prev.some((a) => a.id === action.id)) return prev;
      return [...prev, action];
    });
  }, []);

  const unregisterAction = useCallback((id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value: DevtoolsContextType = {
    isOpen,
    setIsOpen,
    plugins,
    registerPlugin,
    unregisterPlugin,
    statusBarItems,
    registerStatusBarItem,
    unregisterStatusBarItem,
    actions,
    registerAction,
    unregisterAction,
    activeTab,
    setActiveTab,
    isDark,
  };

  return (
    <DevtoolsContext.Provider value={value}>
      {children}
    </DevtoolsContext.Provider>
  );
}

export function useDevtools() {
  const context = useContext(DevtoolsContext);
  if (!context) {
    throw new Error("useDevtools must be used within DevtoolsProvider");
  }
  return context;
}
