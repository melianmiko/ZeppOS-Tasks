import './lib/zeppos/device-polyfill'
import { MessageBuilder } from './lib/zeppos/message'
import { ConfigStorage } from "./lib/mmk/ConfigStorage";

import {FsTools} from "./lib/mmk/Path";
import {t} from "./lib/mmk/i18n";

import "./page/Translations";

// hmApp.packageInfo broken, again
// These parameters are required for Mi Band 7, to build absolute path
// for hmFS.remove. On Amazfit devices, this data isn't used.

const appId = 1023438;
FsTools.overrideAppPage = [
  "js_apps",
  appId.toString(16).padStart(8, "0").toUpperCase()
];

// MsgBuilder, config storage class
const messageBuilder = new MessageBuilder({ appId });
const config = new ConfigStorage();


App({
  globalData: {
    messageBuilder,
    config,
    t,
  },

  onCreate(options) {
    console.log("app.onCreate()");
    messageBuilder.connect();
    config.load();
  },

  onDestroy(options) {
    console.log("app.onDestroy()");
    messageBuilder.disConnect();
  }
})