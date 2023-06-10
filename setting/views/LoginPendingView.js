import { gettext } from 'i18n';
import {HEADER_VIEW} from "../styles";

export function LoginPendingView(props) {
  return View(HEADER_VIEW, [
    Text({
      style: {
        flex: 1
      }
    }, gettext("Please wait...")),
    Button({
      label: gettext("Cancel"),
      style: {
        width: "50%",
        boxShadow: "none"
      },
      onClick: () => {
        props.settingsStorage.setItem("login_status", "logged_out");
        props.settingsStorage.setItem("last_error", "");
      }
    })
  ])
}