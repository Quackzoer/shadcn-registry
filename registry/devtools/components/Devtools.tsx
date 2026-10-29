"use client";

import React, { useEffect } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { DevtoolsProvider, useDevtools } from "@/registry/devtools/lib/context";
import type { DevtoolsConfig } from "@/registry/devtools/types/devtools";
import { DevtoolsButton } from "./DevtoolsButton";
import { DevtoolsPanel } from "./DevtoolsPanel";

const DEFAULT_HOTKEY = "Control+Shift+D" as const;

function DevtoolsContent({ config }: { config: DevtoolsConfig }) {
  const { setIsOpen, isOpen, registerPlugin, unregisterPlugin } = useDevtools();

  useEffect(() => {
    for (const plugin of config.plugins ?? []) {
      registerPlugin(plugin);
    }
    return () => {
      for (const plugin of config.plugins ?? []) {
        unregisterPlugin(plugin.id);
      }
    };
  }, [config.plugins, registerPlugin, unregisterPlugin]);

  useEffect(() => {
    if (config.defaultOpen) {
      setIsOpen(true);
    }
  }, [config.defaultOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      config.onOpen?.();
    } else {
      config.onClose?.();
    }
  }, [isOpen, config]);

  const hotkey = config.hotkey === false ? undefined : (config.hotkey ?? DEFAULT_HOTKEY);
  const hotkeyEnabled = config.hotkey !== false;

  useHotkey(
    hotkey ?? DEFAULT_HOTKEY,
    () => setIsOpen(!isOpen),
    { enabled: hotkeyEnabled }
  );

  const isEnabled =
    config.enabled !== false &&
    (process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_DEBUG === "true");

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <DevtoolsButton position={config.position} />
      <DevtoolsPanel position={config.position} theme={config.theme} />
    </>
  );
}

export interface DevtoolsProps extends DevtoolsConfig {
  children: React.ReactNode;
}

export function Devtools({
  children,
  enabled = true,
  position = "bottom",
  defaultOpen = false,
  theme = "auto",
  hotkey = DEFAULT_HOTKEY,
  plugins = [],
  onOpen,
  onClose,
}: DevtoolsProps) {
  return (
    <DevtoolsProvider initialOpen={defaultOpen}>
      <DevtoolsContent
        config={{
          enabled,
          position,
          defaultOpen,
          theme,
          hotkey,
          plugins,
          onOpen,
          onClose,
        }}
      />
      {children}
    </DevtoolsProvider>
  );
}
