import {MarkdownRenderScreen, ResolveFromAssets} from "../../lib/mmk/MarkdownRender";
import {AppGesture} from "../../lib/mmk/AppGesture";

const { t } = getApp()._options.globalData

Page({
  onInit(filename) {
    AppGesture.withYellowWorkaround("left", {
      appid: 1023438,
      url: "page/miband7/MarkdownReader"
    })
    AppGesture.init();

    hmApp.setScreenKeep(true);
    hmSetting.setBrightScreen(15);

    try {
      const resolver = new ResolveFromAssets("raw/help",
          "page/amazfit/", `help/${t("help_file_prefix")}`);
      const reader = new MarkdownRenderScreen(resolver, filename);
      reader.start();
    } catch(e) {
      console.log(e);
    }
  },
})