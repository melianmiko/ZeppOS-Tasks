import {MarkdownRenderScreen, ResolveFromAssets} from "../../lib/mmk/MarkdownRender";

const { t } = getApp()._options.globalData

Page({
  onInit(filename) {
    hmUI.setStatusBarVisible(true);
    hmUI.updateStatusBarTitle(t("Help index"));

    hmApp.setScreenKeep(true);
    hmSetting.setBrightScreen(15);

    try {
      const url = t("help_file_prefix") + filename;
      const resolver = new ResolveFromAssets("raw/help",
          "page/amazfit/", "help/");
      const reader = new MarkdownRenderScreen(resolver, url);
      reader.start();
    } catch(e) {
      console.log(e);
    }
  },
})