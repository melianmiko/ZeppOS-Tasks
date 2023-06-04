import { HomeScreen } from "../common/HomeScreen";
import {AppGesture} from "../../lib/mmk/AppGesture";

Page({
  onInit(params) {
    AppGesture.withYellowWorkaround("left", {
      appid: 1023438,
      url: "page/miband7/HomeScreen",
      param: params,
    })
    AppGesture.init();

    hmApp.setScreenKeep(true);
    hmSetting.setBrightScreen(15);

    try {
      new HomeScreen(params, "miband7").init();
    } catch(e) {
      console.log(e);
    }
  },

  onDestroy() {
    hmApp.setScreenKeep(false);
    hmSetting.setBrightScreenCancel();
  }
})
