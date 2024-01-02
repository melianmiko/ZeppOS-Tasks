import {gettext as t} from 'i18n';
import {BottomToolbar, SettingsBody} from "../lib/mmk/setting/Layout";
import {AccountTab} from "./tabs/AccountTab";
import {AboutTab} from "./tabs/AboutTab";
import {TabButton} from "../lib/mmk/setting/Tabs";
import {ABOUT_32} from "../lib/mmk/setting/Icons";
import {StateManager} from "../lib/mmk/setting/StateManager";
import {ACCOUNT_32} from "./Icons";

AppSettingsPage({
  build(ctx) {
    const state = new StateManager(ctx, "root");
    const [tab, setTab] = state.useState("account");

    // Trigger Side-Service to start
    const nowTag = (new Date()).toISOString().substring(0, 19);
    if(ctx.settingsStorage.getItem("now") !== nowTag) ctx.settingsStorage.setItem("now", nowTag);
    return SettingsBody([
      tab === "account" ? AccountTab(ctx) : null,
      tab === "about" ? AboutTab(ctx) : null,
      // TabOffset(),
      BottomToolbar([
        TabButton({
          text: t("Account"),
          icon: ACCOUNT_32,
          active: tab === "account",
          callback: () => setTab("account"),
        }),
        TabButton({
          text: t("About"),
          icon: ABOUT_32,
          active: tab === "about",
          callback: () => setTab("about"),
        }),
      ]),
    ]);

    // return View({
    //   style: {
    //     margin: "8px"
    //   }
    // }, [
    //     Headline("Debug"),
    //     Toggle({label: "Force offline", settingsKey: "force_offline"}),
    // ]);
  },
})
