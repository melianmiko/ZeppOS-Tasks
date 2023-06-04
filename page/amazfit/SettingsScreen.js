import { SettingsScreen } from "../common/SettingsScreen";

Page({
  onInit(params) {
    hmUI.setStatusBarVisible(true);
    hmUI.updateStatusBarTitle("");

    new SettingsScreen(params, "amazfit").build();
  }
})
