"use client";

import React, { useState, useEffect } from "react";
import type { DevtoolsPlugin, DevtoolsPluginProps } from "@/registry/devtools/types/devtools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface LogEntry {
  id: string;
  level: "log" | "warn" | "error" | "info";
  message: string;
  timestamp: Date;
  args: unknown[];
}

function ConsolePluginComponent({ isDark }: DevtoolsPluginProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const createLogger =
      (level: LogEntry["level"]) => (...args: unknown[]) => {
        setLogs((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            level,
            message: args.map(String).join(" "),
            timestamp: new Date(),
            args,
          },
        ]);
      };

    console.log = createLogger("log");
    console.warn = createLogger("warn");
    console.error = createLogger("error");
    console.info = createLogger("info");

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, []);

  const getBadgeVariant = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "destructive";
      case "warn":
        return "secondary";
      case "info":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-2 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm">Console Logs ({logs.length})</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setLogs([])}
          className="h-6"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-1 font-mono text-xs max-h-80 overflow-auto">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">No logs yet</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 py-1">
              <Badge variant={getBadgeVariant(log.level)} className="mt-0.5">
                {log.level}
              </Badge>
              <div className="flex-1 break-words">
                <p>{log.message}</p>
                <p className="text-muted-foreground text-xs">
                  {log.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export const ConsolePlugin: DevtoolsPlugin = {
  id: "console",
  name: "Console",
  component: ConsolePluginComponent,
  order: 0,
};
