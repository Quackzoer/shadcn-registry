"use client";

import React, { useEffect } from "react";
import { DevtoolsProvider, useDevtools } from "./context";
import type { DevtoolsConfig } from "./types";
import { DevtoolsButton } from "./DevtoolsButton";
import { DevtoolsPanel } from "./DevtoolsPanel";

function DevtoolsContent({ config }: { config: DevtoolsConfig }) {
  const { setIsOpen, isOpen } = useDevtools();

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

  const isEnabled =
    config.enabled !== false &&
    (process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_DEBUG === "true");

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <DevtoolsButton />
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
          plugins,
          onOpen,
          onClose,
        }}
      />
      {children}
    </DevtoolsProvider>
  );
}
