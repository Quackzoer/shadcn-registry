import type { ReactNode } from "react";
import type { PluginManager } from "./plugin-manager";

export class DevtoolsPluginBase {
  constructor(
    private manager: PluginManager,
    public id: string,
  ) {}

  ready(): void {}

  addTab(tab: { id: string; label: ReactNode; content: ReactNode }): void {
    this.manager.registerTab(this.id, tab);
  }

  addStatusBarItem(item: { id: string; item: ReactNode }): void {
    this.manager.registerStatusBarItem(this.id, item);
  }

  addAction(action: {
    id: string;
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  }): void {
    this.manager.registerAction(this.id, action);
  }
}
