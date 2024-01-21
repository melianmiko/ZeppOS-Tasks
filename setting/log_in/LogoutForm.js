import {gettext as t} from "i18n";
import {StateManager} from "../../lib/mmk/setting/StateManager";
import {CenteredPane, TextRoot} from "../../lib/mmk/setting/Layout";
import {Paragraph, Title} from "../../lib/mmk/setting/Typography";
import {PrimaryButton} from "../../lib/mmk/setting/Buttons";
import {TabOffset} from "../../lib/mmk/setting/Tabs";
import {APP_ICON_32, BRAND_GOOGLE_32, BRAND_MICROSOFT_32, BRAND_NEXTCLOUD_32, LINK_32} from "../Icons";

export function LogoutForm(ctx) {
  const state = new StateManager(ctx, "logout_form");
  const [isOffline, _] = state.useSetting("is_forever_offline");
  const [provider, __] = state.useSetting("login_provider");

  const providerIcon = {
    google: BRAND_GOOGLE_32,
    microsoft: BRAND_MICROSOFT_32,
    caldav: BRAND_NEXTCLOUD_32,
  }[provider];

  return CenteredPane([
    TextRoot([
      View({
        style: {
          marginBottom: "24px",
        }
      }, [
        Icon(providerIcon),
        Icon(LINK_32),
        Icon(APP_ICON_32),
      ]),
      Title(t("Login success")),
      Paragraph([
        t("Now Tasks on ZeppOS have access to tasks in your cloud account."),
      ]),
      View({
        style: {
          marginTop: "24px",
        }
      }, [
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

function Icon(dataURL) {
  return View({
    style: {
      display: "inline-block",
      width: 32,
      height: 32,
      margin: "0 4px",
      backgroundImage: dataURL,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    }
  }, [])
}
