'use client'

import { useMemo, useState } from 'react'
import { Devtools } from '@/registry/devtools'
import { DevtoolsPluginBase } from '@/registry/devtools/lib/devtools-plugin'
import { PluginManager } from '@/registry/devtools/lib/plugin-manager'
import { ConsolePlugin } from '@/registry/devtools/components/plugins/ConsolePlugin'
import { EnvPlugin } from '@/registry/devtools/components/plugins/EnvPlugin'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { RefreshCw, Trash2 } from 'lucide-react'

class SeederPlugin extends DevtoolsPluginBase {
  ready() {
    this.addTab({
      id: 'seeder-main',
      label: 'Data Seeder',
      content: (
        <div className="space-y-4 p-4">
          <h3 className="font-semibold text-sm">Data Seeder</h3>
          <p className="text-muted-foreground text-sm">
            A class-based plugin with tabs, actions, and status bar items.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Seed Users</Button>
            <Button size="sm" variant="outline">Seed Posts</Button>
            <Button size="sm" variant="destructive">Clear All</Button>
          </div>
        </div>
      ),
    })

    this.addAction({
      id: 'seeder:refresh',
      label: 'Refresh data',
      icon: <RefreshCw className="h-3.5 w-3.5" />,
      onClick: () => console.log('Refreshing seeder data...'),
    })

    this.addAction({
      id: 'seeder:clear',
      label: 'Clear seeded data',
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onClick: () => console.log('Clearing seeded data...'),
    })

    this.addStatusBarItem({
      id: 'seeder:status',
      item: <Badge variant="outline" className="text-[10px]">seeder ready</Badge>,
    })
  }
}

function HotkeyDisplay({ hotkey }: { hotkey: string }) {
  const keys = hotkey.split('+')
  return (
    <KbdGroup>
      {keys.map((key, i) => (
        <span key={key} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground">+</span>}
          <Kbd>{key}</Kbd>
        </span>
      ))}
    </KbdGroup>
  )
}

export default function DevtoolsDemoPage() {
  const [count, setCount] = useState(0)

  const classBasedPlugins = useMemo(() => {
    const manager = new PluginManager()
    manager.register(SeederPlugin, 'seeder', { name: 'Seeder', order: 2 })
    return manager.getAllPluginInterfaces()
  }, [])

  return (
    <Devtools
      hotkey="Control+Shift+D"
      plugins={[ConsolePlugin, EnvPlugin, ...classBasedPlugins]}
      position="right"
    >
      <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">DevTools</h1>
          <p className="text-muted-foreground">
            Pluggable in-app devtools drawer. Open it with{' '}
            <HotkeyDisplay hotkey="Control+Shift+D" /> or click the{' '}
            <Badge variant="outline" className="mx-0.5">
              ⚡
            </Badge>{' '}
            button in the bottom-right corner.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Hotkey Toggle</CardTitle>
            <CardDescription>
              Press <HotkeyDisplay hotkey="Control+Shift+D" /> to open and close
              the devtools drawer. The hotkey is configurable via the{' '}
              <code className="text-muted-foreground">hotkey</code> prop.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary">Ctrl+Shift+D</Badge>
              <Badge variant="outline">configurable</Badge>
              <Badge variant="outline">global listener</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interactive Content</CardTitle>
            <CardDescription>
              Devtools coexist with your app. Interact with this page while the
              drawer is open.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setCount((c) => c + 1)}>
              Count: {count}
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log('Button clicked at', new Date().toISOString())}
            >
              Log to Console
            </Button>
            <Button
              variant="destructive"
              onClick={() => console.error('Something went wrong!')}
            >
              Trigger Error
            </Button>
            <Button
              variant="secondary"
              onClick={() => console.warn('Warning message')}
            >
              Trigger Warning
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class-Based Plugins</CardTitle>
            <CardDescription>
              Extend <code className="text-muted-foreground">DevtoolsPluginBase</code> and
              use methods like <code className="text-muted-foreground">addTab</code>,{' '}
              <code className="text-muted-foreground">addAction</code>, and{' '}
              <code className="text-muted-foreground">addStatusBarItem</code> to
              register content. The PluginManager handles the rest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
              <code>{`class MyPlugin extends DevtoolsPluginBase {
  ready() {
    this.addTab({ id: 'main', label: 'My Tab', content: <div /> })
    this.addAction({ id: 'act', label: 'Do thing', icon: <Zap />, onClick: () => {} })
    this.addStatusBarItem({ id: 'stat', item: <Badge>ok</Badge> })
  }
}

const manager = new PluginManager()
manager.register(MyPlugin, 'my-plugin', { name: 'My Plugin' })`}</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>
              Wrap your app with <code className="text-muted-foreground">Devtools</code> and
              pass in plugins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
              <code>{`<Devtools
  hotkey="Control+Shift+D"
  plugins={[ConsolePlugin, EnvPlugin, ...classBasedPlugins]}
>
  {children}
</Devtools>`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </Devtools>
  )
}
