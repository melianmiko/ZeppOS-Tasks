import {gettext} from 'i18n';
import {CAPTION_VIEW} from "../styles";
import {LoginStatusView} from "./LoginStatusView";

export const PRIVACY_POLICY_LINK = "https://melianmiko.ru/en/zepptasks_privacy/";

export function LoginButtonView(props) {
  return View({}, [
      LoginStatusView({
        title: gettext("Log in with Google"),
        subtitle: gettext("Sign in to synchronize your tasks with Google Tasks.")
      }),
    View({
      style: {
        textAlign: "center",
        margin: "12px 0"
      },
      onClick: () => {
        props.settingsStorage.setItem("login_status", "login_started");
        props.settingsStorage.setItem("last_error", "");
      }
    }, [
      Image({
        src: "https://st.melianmiko.ru/3rd/google_sign_in.png",
        style: {
          maxWidth: "min(60vw,382px)"
        },
        alt: "Sign in with Google",
      }),
    ]),

    View({
      style: {
        textAlign: "center",
        fontSize: ".9em"
      }
    }, [
      Link({
        source: PRIVACY_POLICY_LINK
      }, gettext("Privacy Policy"))
    ])
  ])
}
