"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// 1. Define the Context with Generics
interface PermissionContextType<TUser = any, TPermission = string> {
  user: TUser | null | undefined;
  /**
   * The core predicate function that decides access.
   * Takes the user context and the requirement(s), returning a boolean.
   */
  judge: (user: TUser | null | undefined, require: TPermission | TPermission[]) => boolean | TPermission | TPermission[];
}

const PermissionContext = React.createContext<PermissionContextType<any, any> | null>(null);

export function useAuth<TUser = any, TPermission = string>() {
  const context = React.useContext(PermissionContext) as PermissionContextType<TUser, TPermission> | null;
  if (!context) {
    throw new Error("useAuth must be used within a <PermissionProvider />");
  }

  const hasPermission = (requiredPermission: TPermission | TPermission[]) => {
    return context.judge(context.user, requiredPermission);
  };

  return { user: context.user, hasPermission };
}

// 2. The Provider Wrapper
interface PermissionProviderProps<TUser, TPermission> {
  user: TUser | null | undefined;
  judge: (user: TUser | null | undefined, require: TPermission | TPermission[]) => true | TPermission| TPermission[];
  children: React.ReactNode;
}

export function PermissionProvider<TUser, TPermission>({
  user,
  judge,
  children,
}: Readonly<PermissionProviderProps<TUser, TPermission>>) {
  return (
    <PermissionContext.Provider value={{ user, judge }}>
      <TooltipProvider>{children}</TooltipProvider>
    </PermissionContext.Provider>
  );
}

// 3. The Structural Shield Component
export interface PermissionShieldProps<TPermission = string> {
  children: React.ReactNode;
  require: TPermission | TPermission[];
  fallbackMode?: "hide" | "disable" | "blur";
  message?: string;
  fallback?: React.ReactNode | ((notMetPermissions: TPermission | TPermission[])=>React.ReactNode);
}

export function PermissionShield<TPermission = string>({
  children,
  require,
  fallbackMode = "hide",
  message = "You do not have permission to perform this action.",
  fallback = null,
}: Readonly<PermissionShieldProps<TPermission>>) {
  const { hasPermission } = useAuth<any, TPermission>();
  const hasPermissionRes = hasPermission(require)
  const allowed = typeof hasPermissionRes === 'boolean';

  if (allowed) return <>{children}</>;
  const renderFallback = typeof fallback === 'function' ? fallback(hasPermissionRes) : fallback
  if (fallbackMode === "hide") return <>{renderFallback}</>;

  if (fallbackMode === "disable") {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <span className="cursor-not-allowed inline-block w-full">
            {React.isValidElement(children)
              ? React.cloneElement(children as React.ReactElement<any>, {
                  disabled: true,
                  className: cn((children.props as any).className, "pointer-events-none opacity-60"),
                })
              : children}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-center">
          <p className="flex items-center gap-1.5 text-xs">
            <Lock className="h-3 w-3 text-destructive" />
            {message}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (fallbackMode === "blur") {
    return (
      <div className="relative overflow-hidden group select-none">
        <div className="blur-[4px] pointer-events-none opacity-50 transition-all">
          {children}
        </div>
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 border border-dashed rounded-lg animate-in fade-in duration-300">
          <div className="bg-popover text-popover-foreground px-4 py-3 rounded-xl shadow-md border flex flex-col items-center gap-2 max-w-sm text-center">
            <div className="bg-muted p-2 rounded-full">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs font-medium leading-none">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
