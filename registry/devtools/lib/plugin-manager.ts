import React from "react";
import { DevtoolsPluginBase } from "./devtools-plugin";
import type {
  DevtoolsPlugin,
  DevtoolsTab,
  DevtoolsStatusBarItem,
  DevtoolsAction,
} from "../types/devtools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PluginClass = new (manager: PluginManager, id: string) => DevtoolsPluginBase;

interface PluginMeta {
  instance: DevtoolsPluginBase;
  name: string;
  order?: number;
}

export class PluginManager {
  private plugins = new Map<string, PluginMeta>();
  private tabs = new Map<string, DevtoolsTab[]>();
  private statusBarItems = new Map<string, DevtoolsStatusBarItem[]>();
  private actions = new Map<string, DevtoolsAction[]>();

  register(
    PluginClass: PluginClass,
    id: string,
    options: { name: string; order?: number } = { name: id },
  ): void {
    if (this.plugins.has(id)) return;

    const instance = new PluginClass(this, id);
    this.plugins.set(id, { instance, name: options.name, order: options.order });
    this.tabs.set(id, []);
    this.statusBarItems.set(id, []);
    this.actions.set(id, []);
    instance.ready();
  }

  unregister(pluginId: string): void {
    this.plugins.delete(pluginId);
    this.tabs.delete(pluginId);
    this.statusBarItems.delete(pluginId);
    this.actions.delete(pluginId);
  }

  registerTab(pluginId: string, tab: DevtoolsTab): void {
    const list = this.tabs.get(pluginId);
    if (list && !list.some((t) => t.id === tab.id)) {
      list.push(tab);
    }
  }

  registerStatusBarItem(
    pluginId: string,
    item: DevtoolsStatusBarItem,
  ): void {
    const list = this.statusBarItems.get(pluginId);
    if (list && !list.some((s) => s.id === item.id)) {
      list.push(item);
    }
  }

  registerAction(pluginId: string, action: DevtoolsAction): void {
    const list = this.actions.get(pluginId);
    if (list && !list.some((a) => a.id === action.id)) {
      list.push(action);
    }
  }

  getTabs(pluginId: string): DevtoolsTab[] {
    return this.tabs.get(pluginId) ?? [];
  }

  getStatusBarItems(pluginId: string): DevtoolsStatusBarItem[] {
    return this.statusBarItems.get(pluginId) ?? [];
  }

  getActions(pluginId: string): DevtoolsAction[] {
    return this.actions.get(pluginId) ?? [];
  }

  toPluginInterface(pluginId: string): DevtoolsPlugin {
    const meta = this.plugins.get(pluginId);
    const manager = this;
    const pluginName = meta?.name ?? pluginId;

    function PluginComponent() {
      const pluginTabs = manager.getTabs(pluginId);

      if (pluginTabs.length === 0) {
        return React.createElement(
          "p",
          { className: "text-muted-foreground p-4 text-sm" },
          "No content registered.",
        );
      }

      if (pluginTabs.length === 1) {
        return pluginTabs[0].content;
      }

      return React.createElement(
        Tabs,
        { defaultValue: pluginTabs[0].id, className: "w-full px-4 pb-4" },
        React.createElement(
          TabsList,
          {
            className: "grid w-full",
            style: {
              gridTemplateColumns: `repeat(${pluginTabs.length}, minmax(0, 1fr))`,
            },
          },
          ...pluginTabs.map((tab) =>
            React.createElement(
              TabsTrigger,
              { key: tab.id, value: tab.id },
              tab.label,
            ),
          ),
        ),
        ...pluginTabs.map((tab) =>
          React.createElement(
            TabsContent,
            { key: tab.id, value: tab.id, className: "mt-4" },
            React.createElement(
              "div",
              { className: "max-h-[calc(50vh-120px)] overflow-auto" },
              tab.content,
            ),
          ),
        ),
      );
    }

    return {
      id: pluginId,
      name: pluginName,
      component: PluginComponent,
      order: meta?.order,
    };
  }

  getAllPluginInterfaces(): DevtoolsPlugin[] {
    return Array.from(this.plugins.keys()).map((id) =>
      this.toPluginInterface(id),
    );
  }
}
