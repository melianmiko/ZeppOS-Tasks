import { gettext } from 'i18n';
import {LoginButtonView} from "./views/LoginButtonView";
import {LogoutButtonView} from "./views/LogoutButtonView";
import {LoginPendingView} from "./views/LoginPendingView";
import {LoginForm} from "./views/LoginForm";
import {LastErrorView} from "./views/LastErrorView";
import {Headline} from "./views/Headline";
import {Paragraph, Paragraph2} from "./views/Paragraph";
import {VERSION} from "../version";
import {URL_TO_COPY} from "./styles";

AppSettingsPage({
  build(props) {
    const status = props.settingsStorage.getItem("login_status");

    let loginUI = null;
    switch(status) {
      case "logged_out":
        loginUI = LoginButtonView(props);
        break;
      case "login_started":
      case "logging_in":
        loginUI = LoginPendingView(props);
        break;
      case "login_form":
      case "login_form_resp":
        loginUI = LoginForm(props, status === "login_form_resp");
        break;
      default:
        loginUI = LogoutButtonView(props);
        break;
    }

    return View({
      style: {
        margin: "8px"
      }
    }, [
        Headline(gettext("Account")),
        loginUI,
        LastErrorView(props),

        Headline("Debug"),
        Toggle({label: "Force offline", settingsKey: "force_offline"}),

        Headline(gettext("About")),
        Paragraph([
            Text({}, `ZeppTasks ${VERSION}`)
        ]),
        Paragraph2([
            Text({}, gettext("Like this application? Consider to support their development with a small donation: ")),
            Text(URL_TO_COPY, "https://mmk.pw/donate")
        ]),
        Paragraph2([
            Text({}, gettext("Want to see ZeppTasks into another language? You can help us with translation: ")),
            Text(URL_TO_COPY, "https://crowdin.com/project/zepptasks")
        ]),
        Paragraph2([
            Text({}, gettext("Source code available: ")),
            Text(URL_TO_COPY, "https://github.com/melianmiko/ZeppOS-Tasks")
        ])
    ]);
  },
})
