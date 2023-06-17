import {MarkdownRenderScreen, ResolveFromAssets} from "../../lib/mmk/MarkdownRender";

const { t } = getApp()._options.globalData

Page({
  onInit(filename) {
    hmUI.setStatusBarVisible(true);
    hmUI.updateStatusBarTitle(t("Help index"));

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