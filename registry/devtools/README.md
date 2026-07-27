# DevTools Library

A TanStack DevTools-inspired, plugin-extensible development tools library for your Next.js app. Shows a drawer with customizable tabs for debugging and inspection.

## Features

- **Plugin System**: Extensible architecture for adding custom debugging tools
- **Drawer UI**: Shadcn drawer-based interface that doesn't obstruct the app
- **Environment-aware**: Only shows in development or when `NEXT_PUBLIC_DEBUG=true`
- **Easy Integration**: Wrap your app with the `Devtools` component
- **Type-safe**: Full TypeScript support for plugins

## Setup

Wrap your root layout with the `Devtools` component:

```tsx
import { Devtools } from "@/components/devtools";
import { ConsolePlugin, EnvPlugin } from "@/components/devtools/plugins";

export default function RootLayout({ children }) {
  return (
    <Devtools
      defaultOpen={false}
      position="bottom"
      theme="auto"
      plugins={[ConsolePlugin, EnvPlugin]}
    >
      <html>
        <body>{children}</body>
      </html>
    </Devtools>
  );
}
```

## Creating Custom Plugins

Plugins are simple React components that expose inspection or debugging UI.

### Basic Plugin

```tsx
import type { DevtoolsPlugin, DevtoolsPluginProps } from "@/components/devtools";

function MyPluginComponent({ isDark }: DevtoolsPluginProps) {
  return <div>My custom tool content</div>;
}

export const MyPlugin: DevtoolsPlugin = {
  id: "my-plugin",        // Unique identifier
  name: "My Tool",        // Display name in tab
  component: MyPluginComponent,
  order: 2,               // Tab order (optional)
  icon: <MyIcon />,       // Tab icon (optional)
};
```

### Using useDevtools Hook

Access DevTools context in any child component:

```tsx
import { useDevtools } from "@/components/devtools";

export function MyComponent() {
  const { plugins, isOpen, setIsOpen } = useDevtools();

  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      Toggle DevTools
    </button>
  );
}
```

## Configuration

The `Devtools` component accepts:

```tsx
interface DevtoolsProps {
  enabled?: boolean;          // Enable/disable (default: true)
  position?: "bottom" | "right" | "left";  // Drawer position (default: bottom)
  defaultOpen?: boolean;      // Start open (default: false)
  theme?: "light" | "dark" | "auto";  // Theme (default: auto)
  plugins?: DevtoolsPlugin[]; // Plugin array
  onOpen?: () => void;        // Open callback
  onClose?: () => void;       // Close callback
}
```

## Built-in Plugins

### ConsolePlugin
Captures console logs with filtering by level (log, warn, error, info).

```tsx
import { ConsolePlugin } from "@/components/devtools/plugins";
```

### EnvPlugin
Displays environment variables and runtime configuration.

```tsx
import { EnvPlugin } from "@/components/devtools/plugins";
```

## Advanced Usage

### Dynamic Plugin Registration

Register plugins at runtime using `useDevtools`:

```tsx
import { useDevtools } from "@/components/devtools";

export function DynamicPluginLoader() {
  const { registerPlugin } = useDevtools();

  useEffect(() => {
    registerPlugin(MyCustomPlugin);
  }, []);

  return null;
}
```

### Environment Detection

DevTools only displays when:
- `NODE_ENV === "development"` OR
- `NEXT_PUBLIC_DEBUG === "true"`

Override with `enabled` prop:

```tsx
<Devtools enabled={process.env.NEXT_PUBLIC_DEBUG === "true"} />
```

## Examples

Check the `plugins/` directory for example implementations:
- `ConsolePlugin.tsx` - Console log capture
- `EnvPlugin.tsx` - Environment variable inspection
