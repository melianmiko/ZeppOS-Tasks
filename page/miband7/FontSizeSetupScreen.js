import { FontSizeSetupScreen } from "../../lib/mmk/FontSizeSetupScreen";
import {AppGesture} from "../../lib/mmk/AppGesture";

const { config } = getApp()._options.globalData

class ConfiguredFontSizeSetupScreen extends FontSizeSetupScreen {
  getSavedFontSize(f) {
    return config.get("fontSize", f);
  }

  onChange(v) {
    config.set("fontSize", v);
  }
}

Page({
  onInit() {
    AppGesture.withYellowWorkaround("left", {
      appid: 1023438,
      url: "page/miband7/FontSizeSetupScreen"
    })
    AppGesture.init();

    new ConfiguredFontSizeSetupScreen().start();
  }
})
