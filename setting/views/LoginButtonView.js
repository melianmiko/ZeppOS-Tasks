import {gettext} from 'i18n';
import {CAPTION_VIEW} from "../styles";

export const PRIVACY_POLICY_LINK = "https://melianmiko.ru/en/zepptasks_privacy/";

export function LoginButtonView(props) {
  return View({}, [
    View({
      style: {
        textAlign: "center",
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
    View(CAPTION_VIEW, [
      Text({}, gettext("Sign in to synchronize your tasks with Google Tasks.")),
      Link({
        source: PRIVACY_POLICY_LINK
      }, gettext("Privacy Policy"))
    ])
  ])
}
