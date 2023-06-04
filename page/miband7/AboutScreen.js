import { AboutScreen } from "../common/AboutScreen";
import {AppGesture} from "../../lib/mmk/AppGesture";

Page({
  onInit(params) {
    AppGesture.withYellowWorkaround("left", {
      appid: 1023438,
      url: "page/miband7/AboutScreen",
      param: params,
    })
    AppGesture.init();

    new AboutScreen(params).start();
  }
})
