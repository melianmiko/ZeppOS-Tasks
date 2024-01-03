import {gettext as t} from 'i18n';
import {BottomToolbar, SettingsBody} from "../lib/mmk/setting/Layout";
import {AccountTab} from "./tabs/AccountTab";
import {AboutTab} from "./tabs/AboutTab";
import {TabButton} from "../lib/mmk/setting/Tabs";
import {ABOUT_32, SETTINGS_32} from "../lib/mmk/setting/Icons";
import {StateManager} from "../lib/mmk/setting/StateManager";
import {ACCOUNT_32} from "./Icons";
import {DebugTab} from "./tabs/DebugTab";

AppSettingsPage({
  build(ctx) {
    const state = new StateManager(ctx, "root");
    const [tab, setTab] = state.useState("account");
    const [debugCounter, setDebugCounter] = state.useState(10);

    // Hidden trigger
    function setTabDebugTrigger(newTab) {
      if(tab === newTab && debugCounter > 0) {
        setDebugCounter(debugCounter - 1);
      } else if(debugCounter > 0) {
        setDebugCounter(10);
        setTab(newTab);
      } else {
        setTab(newTab);
      }
    }

    // Trigger Side-Service to start
    const nowTag = (new Date()).toISOString().substring(0, 19);
    if(ctx.settingsStorage.getItem("now") !== nowTag) ctx.settingsStorage.setItem("now", nowTag);

    // Build UI root
    return SettingsBody([
      tab === "account" ? AccountTab(ctx) : null,
      tab === "about" ? AboutTab(ctx) : null,
      tab === "debug" ? DebugTab(ctx) : null,
      // TabOffset(),
      BottomToolbar([
        TabButton({
          text: t("Account"),
          icon: ACCOUNT_32,
          active: tab === "account",
          callback: () => setTab("account"),
        }),
        debugCounter === 0 ? TabButton({
          text: "Debug",
          icon: SETTINGS_32,
          active: tab === "debug",
          callback: () => setTab("debug"),
        }) : null,
        TabButton({
          text: t("About"),
          icon: ABOUT_32,
          active: tab === "about",
          callback: () => setTabDebugTrigger("about"),
        }),
      ]),
    ]);

    // return View({
    //   style: {
    //     margin: "8px"
    //   }
    // }, [
    //     Headline("Debug"),
    // ]);
  },
})
