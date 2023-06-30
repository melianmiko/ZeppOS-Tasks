import { SCREEN_WIDTH, SCREEN_HEIGHT, IS_LOW_RAM_DEVICE } from "../../lib/mmk/UiParams";

Page({
  onInit() {
    hmUI.setStatusBarVisible(false);
    hmSetting.setBrightScreen(60);

    const image_size = IS_LOW_RAM_DEVICE ? 174 : 297;
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
