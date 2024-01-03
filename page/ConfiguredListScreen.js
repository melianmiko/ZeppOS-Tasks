import { ListScreen } from "../lib/mmk/ListScreen";

const { config } = getApp()._options.globalData

export class ConfiguredListScreen extends ListScreen {
  constructor() {
    super();
    this.accentColor = 0x00a2b6;
    this.fontSize = config.get("fontSize", this.fontSize);
  }
}
