import { ListScreen } from "../../lib/mmk/ListScreen";

const { config } = getApp()._options.globalData

export class ConfiguredListScreen extends ListScreen {
  constructor() {
    super();
    this.fontSize = config.get("fontSize", this.fontSize);
  }
}