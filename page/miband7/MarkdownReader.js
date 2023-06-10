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
      const url = t("help_file_prefix") + filename;
      const resolver = new ResolveFromAssets("raw/help",
          "page/amazfit/", "help/");
      const reader = new MarkdownRenderScreen(resolver, url)
      reader.start();
    } catch(e) {
      console.log(e);
    }
  },
})