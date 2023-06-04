import { gettext } from 'i18n';
import { HEADER_VIEW, CAPTION_VIEW } from "../styles";

export function LogoutButtonView(props) {
  return View({}, [
  View(HEADER_VIEW, [
      Text({
        style: {
          flex: 1
        }
      }, gettext("sginInOk")),
      Button({
        label: gettext("logOut"),
        style: {
          width: "50%",
          background: "#ddd",
          boxShadow: "none"
        },
        onClick: () => {
          props.settingsStorage.setItem("access_token", "");
          props.settingsStorage.setItem("refresh_token", "");
          props.settingsStorage.setItem("auth_token", "");
          props.settingsStorage.setItem("last_error", "");
          props.settingsStorage.setItem("login_status", "logged_out");
        }
      })
    ]),
    View(CAPTION_VIEW, [Text({}, gettext("continueOnWatch"))]),
  ]);
}
