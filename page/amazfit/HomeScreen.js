import { HomeScreen } from "../common/HomeScreen";

const { t } = getApp()._options.globalData

Page({
  onInit(params) {
    console.log("HomePage.build()");
    hmUI.setStatusBarVisible(true);
    hmUI.updateStatusBarTitle(t("Tasks"));

    hmApp.setScreenKeep(true);
    hmSetting.setBrightScreen(15);

    try {
      new HomeScreen(params, "amazfit").init();
    } catch(e) {
      console.log(e);
    }
  },

  onDestroy() {
    hmApp.setScreenKeep(false);
    hmSetting.setBrightScreenCancel();
  }
})
