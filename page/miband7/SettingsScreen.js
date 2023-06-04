import { SettingsScreen } from "../common/SettingsScreen";
import {AppGesture} from "../../lib/mmk/AppGesture";

Page({
  onInit(params) {
    AppGesture.withYellowWorkaround("left", {
      appid: 1023438,
      url: "page/miband7/SettingsScreen",
      param: params,
    })
    AppGesture.init();

    new SettingsScreen(params, "miband7").build();
  }
})
