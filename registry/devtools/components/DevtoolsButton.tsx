"use client";

import React from "react";
import { useDevtools } from "@/registry/devtools/lib/context";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function DevtoolsButton() {
  const { isOpen, setIsOpen } = useDevtools();

  return (
    <Button
      onClick={() => setIsOpen(!isOpen)}
      size="icon"
      className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg"
      variant={isOpen ? "default" : "outline"}
      title={isOpen ? "Close DevTools" : "Open DevTools"}
    >
      <Zap className="h-4 w-4" />
    </Button>
  );
}
