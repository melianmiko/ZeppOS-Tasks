import { 
  ICON_SIZE_MEDIUM, 
  IS_LOW_RAM_DEVICE, 
  SCREEN_WIDTH, 
  SCREEN_HEIGHT 
} from "../lib/mmk/UiParams";

const { messageBuilder, t } = getApp()._options.globalData

export function request(data, timeout = 10000) {
  if(!hmBle.connectStatus()) return Promise.reject("No connection to phone");
  return messageBuilder.request(data, {timeout}).then((data) => {
    if(data.error) 
      throw new Error(data.error);
    return Promise.resolve(data);
  });
}

export function createSpinnerLowRam() {
  const spinner = hmUI.createWidget(hmUI.widget.IMG, {
    x: Math.floor((SCREEN_WIDTH - ICON_SIZE_MEDIUM) / 2),
    y: Math.floor((SCREEN_HEIGHT - ICON_SIZE_MEDIUM) / 2),
    src: "spinner.png"
  });
  return () => hmUI.deleteWidget(spinner);
}

export function createSpinner() {
  if(IS_LOW_RAM_DEVICE) return createSpinnerLowRam();

  const spinner = hmUI.createWidget(hmUI.widget.IMG_ANIM, {
    x: Math.floor((SCREEN_WIDTH - ICON_SIZE_MEDIUM) / 2),
    y: Math.floor((SCREEN_HEIGHT - ICON_SIZE_MEDIUM) / 2),
    anim_path: "spinner",
    anim_prefix: "img",
    anim_ext: "png",
    anim_fps: 12,
    anim_size: 12,
    anim_status: hmUI.anim_status.START,
    repeat_count: 0,
  });

  return () => hmUI.deleteWidget(spinner);
}

export function getOfflineInfo(err) {
  if(err.startsWith("Timed out"))
    return t("Work offline, connection timed out");

  switch(err) {
    case "login_first":
      return t("Log into your Google account via Zepp app to use all features");
    default:
      return err;
  }
}
