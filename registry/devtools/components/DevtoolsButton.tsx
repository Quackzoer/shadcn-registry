"use client";

import React from "react";
import { useDevtools } from "@/registry/devtools/lib/context";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import type { DevtoolsConfig } from "@/registry/devtools/types/devtools";
import { cn } from "@/lib/utils";

export function DevtoolsButton({
  position = "bottom",
}: Pick<DevtoolsConfig, "position">) {
  const { isOpen, setIsOpen } = useDevtools();

  return (
    <Button
      onClick={() => setIsOpen(!isOpen)}
      size="icon"
      className={cn(
        "fixed z-40 rounded-full shadow-lg",
        position === "left" ? "bottom-4 left-4" : "bottom-4 right-4"
      )}
      variant={isOpen ? "default" : "outline"}
      title={isOpen ? "Close DevTools" : "Open DevTools"}
    >
      <Zap className="h-4 w-4" />
    </Button>
  );
}
