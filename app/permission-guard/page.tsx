"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  PermissionProvider,
  PermissionShield,
  useAuth,
  type PermissionShieldProps,
} from "@/components/ui/permission-guard";

// --- App-Specific Types ---

interface AppUser {
  id: string;
  email: string;
  role: "admin" | "editor" | "billing_manager" | "guest";
  scopes: string[];
  tenantId: string;
}

type AppPermission =
  | "project:delete"
  | "invoice:pay"
  | "content:publish"
  | "team:invite";

type AppRole = AppUser["role"];

// --- Judge Function ---

function appJudge(
  user: AppUser | null | undefined,
  require: AppPermission | AppPermission[],
  roles?: AppRole | AppRole[]
) {
  if (!user) return false;

  if (roles) {
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    if (requiredRoles.includes(user.role)) return true;
  }

  if (user.role === "admin") return true;
  const userPermsSet = new Set(user.scopes)
  const requiredPermissions = Array.isArray(require) ? require : [require];
  const missingPermissions = requiredPermissions.filter((perm) => !userPermsSet.has(perm));
  return missingPermissions.length > 0 ? missingPermissions : true
}

// --- Wrappers ---

function AppAuthProvider({
  user,
  roles,
  children,
}: Readonly<{
  user: AppUser | null | undefined;
  roles?: AppRole | AppRole[];
  children: React.ReactNode;
}>) {
  const judge = React.useCallback(
    (u: AppUser | null | undefined, req: AppPermission | AppPermission[]) =>
      appJudge(u, req, roles),
    [roles]
  );

  return (
    <PermissionProvider user={user} judge={judge}>
      {children}
    </PermissionProvider>
  );
}

function AppGuard(props: PermissionShieldProps<AppPermission>) {
  return <PermissionShield<AppPermission> {...props} />;
}

function useAppAuth() {
  return useAuth<AppUser, AppPermission>();
}

// --- Demo Data ---

const DEMO_USERS: Record<string, AppUser> = {
  admin: {
    id: "1",
    email: "admin@example.com",
    role: "admin",
    scopes: [],
    tenantId: "t1",
  },
  editor: {
    id: "2",
    email: "editor@example.com",
    role: "editor",
    scopes: ["content:publish", "team:invite"],
    tenantId: "t1",
  },
  billing: {
    id: "3",
    email: "billing@example.com",
    role: "billing_manager",
    scopes: ["invoice:pay"],
    tenantId: "t1",
  },
  guest: {
    id: "4",
    email: "guest@example.com",
    role: "guest",
    scopes: [],
    tenantId: "t1",
  },
};

// --- Demo Components ---

function AuthStatus() {
  const { user } = useAppAuth();
  if (!user) return <p className="text-muted-foreground">No user logged in</p>;
  return (
    <div className="text-sm space-y-1">
      <p>
        <span className="font-medium">User:</span> {user.email}
      </p>
      <p>
        <span className="font-medium">Role:</span> {user.role}
      </p>
      <p>
        <span className="font-medium">Scopes:</span>{" "}
        {user.scopes.length > 0 ? user.scopes.join(", ") : "none"}
      </p>
    </div>
  );
}

function GuardDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Permission Guards</h3>

        <AppGuard require="content:publish" fallbackMode="disable">
          <Button>Publish Content</Button>
        </AppGuard>

        <AppGuard require="invoice:pay" fallbackMode="disable">
          <Button>Pay Invoice</Button>
        </AppGuard>

        <AppGuard
          require={["content:publish", "team:invite"]}
          fallbackMode="disable"
          message="You need both content:publish and team:invite scopes"
        >
          <Button>Publish & Invite</Button>
        </AppGuard>

        <AppGuard require="project:delete" fallbackMode="blur">
          <Button variant="destructive">Delete Project</Button>
        </AppGuard>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Role Guards (Provider-level)</h3>
        <p className="text-sm text-muted-foreground">
          These are controlled by the <code>roles</code> prop on{" "}
          <code>AppAuthProvider</code>.
        </p>

        <AppGuard require="team:invite" fallbackMode="disable">
          <Button>Invite Team Member</Button>
        </AppGuard>

        <AppGuard require="invoice:pay" fallbackMode="hide">
          <Button>View Billing</Button>
        </AppGuard>
      </section>
    </div>
  );
}

// --- Page ---

export default function PermissionGuardPage() {
  const [currentUserKey, setCurrentUserKey] = React.useState<string>("editor");
  const users = Object.entries(DEMO_USERS);

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Permission Guard Examples
        </h1>
        <p className="text-muted-foreground">
          Role and permission-based access control with three fallback modes.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {users.map(([key, user]) => (
          <Button
            key={key}
            variant={currentUserKey === key ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentUserKey(key)}
          >
            {user.role} ({user.email})
          </Button>
        ))}
      </div>

      <main className="flex flex-col flex-1 gap-10">
        {(() => {
          const roleFilter: AppRole[] | undefined =
            currentUserKey === "editor" ? ["editor", "guest"] : undefined;

          return (
            <AppAuthProvider
              user={DEMO_USERS[currentUserKey]}
              roles={roleFilter}
            >
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Current User</h2>
                <AuthStatus />
              </section>

              <GuardDemo />
            </AppAuthProvider>
          );
        })()}
      </main>
    </div>
  );
}
