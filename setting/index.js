import {LoginButtonView} from "./views/LoginButtonView";
import {LogoutButtonView} from "./views/LogoutButtonView";
import {LoginPendingView} from "./views/LoginPendingView";
import {LoginForm} from "./views/LoginForm";
import {LastErrorView} from "./views/LastErrorView";
import {Divider} from "./views/Divider";

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
      loginUI,
      LastErrorView(props)
    ]);
  },
})
