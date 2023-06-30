import {SCREEN_HEIGHT, SCREEN_WIDTH} from "../../lib/mmk/UiParams";
import {AppGesture} from "../../lib/mmk/AppGesture";

Page({
  onInit() {
    AppGesture.withYellowWorkaround("left", {
      appid: 1023438,
      url: "page/miband7/DonatePage"
    })
    AppGesture.init();

    hmSetting.setBrightScreen(60);

    const image_size = 174;
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT,
      color: 0xFFFFFF
    });

    hmUI.createWidget(hmUI.widget.IMG, {
      x: Math.floor((SCREEN_WIDTH - image_size) / 2),
      y: Math.floor((SCREEN_HEIGHT - image_size) / 2),
      src: "donate.png"
    })
  },

  onDestroy() {
    hmSetting.setBrightScreenCancel();
  }
})
