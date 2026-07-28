import { DevtoolsPlugin } from "./devtools-plugin";

export class PluginManager {
  plugins: Map<string, DevtoolsPlugin> = new Map();
  constructor(
    private root: HTMLDivElement,
    plugins: Array<DevtoolsPlugin>,
  ) {
    for (const plugin of plugins) {
      const pluginId = plugin.id;
      if (pluginId && this.plugins.has(pluginId))
        this.plugins.set(pluginId, plugin);
    }
  }
}
