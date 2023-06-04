import { AboutScreen } from "../common/AboutScreen";

Page({
  onInit(params) {
    hmUI.setStatusBarVisible(false);
    new AboutScreen(params).start();
  }
})
