import {gettext as t} from 'i18n';
import {StateManager} from "../../lib/mmk/setting/StateManager";
import {CenteredPane, TextRoot} from "../../lib/mmk/setting/Layout";
import {Paragraph, Title} from "../../lib/mmk/setting/Typography";
import {BaseListItem, ListItemText} from "../../lib/mmk/setting/ListItem";
import {LoadingBottomSheet} from "./LoadingBottomSheet";
import {LoginWithResponseBottomSheet} from "./LoginWithResponseBottomSheet";
import {LoginAutoBottomSheet} from "./LoginAutoBottomSheet";

export function LoginForm(ctx) {
  const state = new StateManager(ctx, "login_form");
  const [loginStatus, setLoginStatus] = state.useSetting("login_status", "logged_out");
  const [_, setLoginProvider] = state.useSetting("login_provider");

  console.log(loginStatus);

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
        width: "80vw"
      }
    }, [
      TextRoot([
        Title(t("Set up sync")),
        Paragraph([t("Sign in to synchronize your tasks with cloud.")]),
      ]),
      LoginProviderRow({
        title: t("Use Google account"),
        description: t("Tasks will be in sync with Google tasks"),
        callback: () => useProvider("google"),
      }),
      loginStatus === "login_started" || loginStatus === "logging_in" ?
        LoadingBottomSheet(cancelLogin) : null,
      loginStatus === "login_form_resp" ?
        LoginWithResponseBottomSheet(ctx, cancelLogin) : null,
      loginStatus === "login_form" ?
        LoginAutoBottomSheet(ctx, cancelLogin) : null,
    ])
  ]);
}

export function LoginProviderRow(props) {
  return BaseListItem([
    ListItemText(props.title, props.description),
  ], props.callback)
}
