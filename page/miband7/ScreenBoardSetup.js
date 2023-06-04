import { ScreenBoardSetup } from "../../lib/mmk/ScreenBoardSetup";
import {AppGesture} from "../../lib/mmk/AppGesture";

Page({
  onInit() {
    AppGesture.withYellowWorkaround("left", {
      appid: 1023438,
      url: "page/miband7/ScreenBoardSetup"
    })
    AppGesture.init();

    new ScreenBoardSetup().start();
  }
})
