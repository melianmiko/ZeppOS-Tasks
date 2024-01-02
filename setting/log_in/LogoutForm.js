import {gettext as t} from "i18n";
import {StateManager} from "../../lib/mmk/setting/StateManager";
import {CenteredPane, TextRoot} from "../../lib/mmk/setting/Layout";
import {Paragraph, Title} from "../../lib/mmk/setting/Typography";
import {PrimaryButton} from "../../lib/mmk/setting/Buttons";
import {TabOffset} from "../../lib/mmk/setting/Tabs";

export function LogoutForm(ctx) {
  const state = new StateManager(ctx, "logout_form");
  const [isOffline, _] = state.useSetting("is_forever_offline");

  return CenteredPane([
    TextRoot([
      Title(t("Login success")),
      Paragraph([
        t("Now Tasks on ZeppOS have access to tasks in your cloud account."),
      ]),
      Paragraph([
        PrimaryButton(t("Log out"), () => {
          ctx.settingsStorage.setItem("access_token", "");
          ctx.settingsStorage.setItem("refresh_token", "");
          ctx.settingsStorage.setItem("auth_token", "");
          ctx.settingsStorage.setItem("last_error", "");
          ctx.settingsStorage.setItem("login_status", "logged_out");
        })
      ]),
      ...(isOffline ? [
        Title(t("App is still in offline mode"), {color: "#F90", marginTop: "32px"}),
        Paragraph(t("Open Tasks app on your watch and wipe local data to start seeing synced tasks."), {color: "#F90"}),
      ] : []),
    ]),
  ])
}