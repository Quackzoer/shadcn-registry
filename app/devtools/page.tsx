'use client'

import { useState } from 'react'
import { Devtools } from '@/registry/devtools'
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

  return (
    <Devtools
      hotkey="Control+Shift+D"
      plugins={[ConsolePlugin, EnvPlugin]}
      position='right'
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
  plugins={[ConsolePlugin, EnvPlugin]}
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
