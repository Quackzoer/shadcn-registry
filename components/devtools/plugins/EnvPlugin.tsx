"use client";

import React from "react";
import type { DevtoolsPlugin, DevtoolsPluginProps } from "../types";
import { Badge } from "@/components/ui/badge";

function EnvPluginComponent({ isDark }: DevtoolsPluginProps) {
  const envVars = Object.entries(process.env)
    .filter(([key]) => key.startsWith("NEXT_PUBLIC_"))
    .sort(([a], [b]) => a.localeCompare(b));

  const runtimeVars = {
    NODE_ENV: process.env.NODE_ENV,
    "NEXT_PUBLIC_DEBUG": process.env.NEXT_PUBLIC_DEBUG,
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="font-semibold text-sm mb-2">Environment Variables</h3>
        <div className="space-y-2 font-mono text-xs">
          {envVars.length === 0 ? (
            <p className="text-muted-foreground">
              No NEXT_PUBLIC_* variables found
            </p>
          ) : (
            envVars.map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 py-1 break-all">
                <span className="font-semibold text-primary">{key}</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-green-600 dark:text-green-400">
                  {String(value)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2">Runtime Variables</h3>
        <div className="space-y-2 font-mono text-xs">
          {Object.entries(runtimeVars).map(([key, value]) => (
            <div key={key} className="flex items-start gap-2 py-1">
              <span className="font-semibold text-primary">{key}</span>
              <span className="text-muted-foreground">=</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {String(value)}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const EnvPlugin: DevtoolsPlugin = {
  id: "env",
  name: "Environment",
  component: EnvPluginComponent,
  order: 1,
};
