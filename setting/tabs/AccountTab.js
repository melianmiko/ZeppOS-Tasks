import {StateManager} from "../../lib/mmk/setting/StateManager";
import {LoginForm} from "../log_in/LoginForm";
import {LogoutForm} from "../log_in/LogoutForm";

export function AccountTab(ctx) {
  const state = new StateManager(ctx,"account_tab");
  const [loginStatus, _] = state.useSetting("login_status", "1");
  console.log(1111, loginStatus);

  switch(loginStatus) {
    case "logged_in":
      return LogoutForm(ctx);
    default:
      return LoginForm(ctx);
  }
}