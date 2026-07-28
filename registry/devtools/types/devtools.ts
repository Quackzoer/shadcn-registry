import type { RegisterableHotkey } from "@tanstack/hotkeys";

export interface DevtoolsPlugin {
  id: string;
  name: string;
  icon?: React.ReactNode;
  component: React.ComponentType<DevtoolsPluginProps>;
  order?: number;
}

export interface DevtoolsPluginProps {
  isDark?: boolean;
}

export interface DevtoolsTab {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export interface DevtoolsStatusBarItem {
  id: string;
  item: React.ReactNode;
}

export interface DevtoolsAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface DevtoolsConfig {
  enabled?: boolean;
  position?: "bottom" | "right" | "left";
  defaultOpen?: boolean;
  theme?: "light" | "dark" | "auto";
  hotkey?: RegisterableHotkey | false;
  plugins?: DevtoolsPlugin[];
  onOpen?: () => void;
  onClose?: () => void;
}

export interface DevtoolsContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  plugins: DevtoolsPlugin[];
  registerPlugin: (plugin: DevtoolsPlugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  statusBarItems: DevtoolsStatusBarItem[];
  registerStatusBarItem: (item: DevtoolsStatusBarItem) => void;
  unregisterStatusBarItem: (id: string) => void;
  actions: DevtoolsAction[];
  registerAction: (action: DevtoolsAction) => void;
  unregisterAction: (id: string) => void;
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  isDark: boolean;
}
