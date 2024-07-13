import {gettext as t} from 'i18n';
import {StateManager} from "../../lib/mmk/setting/StateManager";
import {CenteredPane, TextRoot} from "../../lib/mmk/setting/Layout";
import {Paragraph, Title} from "../../lib/mmk/setting/Typography";
import {BaseListItem, ListItemText} from "../../lib/mmk/setting/ListItem";
import {LoadingBottomSheet} from "./LoadingBottomSheet";
import {LoginWithResponseBottomSheet} from "./LoginWithResponseBottomSheet";
import {LoginAutoBottomSheet} from "./LoginAutoBottomSheet";
import {BRAND_GOOGLE_32, BRAND_MICROSOFT_32, BRAND_NEXTCLOUD_32, BRAND_TICK_TICK_32} from "../Icons";
import {LoginNextcloudBottomSheet} from "./LoginNextcloudBottomSheet";

export function LoginForm(ctx) {
  const state = new StateManager(ctx, "login_form");
  const [loginStatus, setLoginStatus] = state.useSetting("login_status", "logged_out");
  const [_, setLoginProvider] = state.useSetting("login_provider");

  function useProvider(id) {
    setLoginProvider(id);
    setLoginStatus("login_started");
  }

  function cancelLogin() {
    setLoginStatus("logged_out");
  }

  return CenteredPane([
    View({
      style: {
        width: "85vw"
      }
    }, [
      TextRoot([
        Title(t("Set up sync")),
        Paragraph([t("Sign in to synchronize your tasks with cloud.")]),
      ]),

      LoginProviderRow({
        icon: BRAND_GOOGLE_32,
        title: t("Use Google account"),
        description: t("Tasks will be in sync with Google tasks"),
        callback: () => useProvider("google"),
      }),
      LoginProviderRow({
        icon: BRAND_MICROSOFT_32,
        title: t("Use Microsoft account"),
        description: t("Tasks will be in sync with Microsoft ToDo"),
        callback: () => useProvider("microsoft"),
      }),
      LoginProviderRow({
        icon: BRAND_TICK_TICK_32,
        title: t("Use TickTick account"),
        description: t("Tasks will be in sync with TickTick application"),
        callback: () => useProvider("tick_tick"),
      }),
      LoginProviderRow({
        icon: BRAND_NEXTCLOUD_32,
        title: t("Use Nextcloud server account") + " (beta)",
        description: t("Sync your tasks with personal cloud server"),
        callback: () => useProvider("caldav"),
      }),

      loginStatus === "login_started" || loginStatus === "logging_in" ?
        LoadingBottomSheet(cancelLogin) : null,
      loginStatus === "login_form_resp" ?
        LoginWithResponseBottomSheet(ctx, cancelLogin) : null,
      loginStatus === "login_form" ?
        LoginAutoBottomSheet(ctx, cancelLogin) : null,
      loginStatus === "login_form_nextcloud" ?
        LoginNextcloudBottomSheet(ctx, cancelLogin) : null,
    ])
  ]);
}

export function LoginProviderRow(props) {
  return BaseListItem([
    Icon(props.icon),
    ListItemText(props.title, props.description),
  ], props.callback)
}

function Icon(dataURL) {
  return View({
    style: {
      width: 32,
      height: 32,
      marginLeft: 8,
      marginRight: 8,
      backgroundImage: dataURL,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    }
  }, [])
}