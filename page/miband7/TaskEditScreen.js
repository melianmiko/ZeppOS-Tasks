import {AppGesture} from "../../lib/mmk/AppGesture";
import {TaskEditScreen} from "../common/TaskEditScreen";

Page({
  onInit(params) {
    AppGesture.withYellowWorkaround("left", {
      appid: 1023438,
      url: "page/miband7/TaskEditScreen",
      param: params,
    })
    AppGesture.init();

    hmApp.setScreenKeep(true);
    hmSetting.setBrightScreen(15);

    try {
      new TaskEditScreen(params, "miband7").init();
    } catch(e) {
      console.log(e);
    }
  },

  onDestroy() {
    hmApp.setScreenKeep(false);
    hmSetting.setBrightScreenCancel();
  }
})
