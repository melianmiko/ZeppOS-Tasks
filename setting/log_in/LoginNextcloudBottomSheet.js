import {gettext as t} from "i18n";
import {BottomSheet} from "../../lib/mmk/setting/BottomSheet";
import {StateManager} from "../../lib/mmk/setting/StateManager";
import {TextRoot} from "../../lib/mmk/setting/Layout";
import {Link, Paragraph} from "../../lib/mmk/setting/Typography";
import {Input} from "../../lib/mmk/setting/Input";
import {PrimaryButton} from "../../lib/mmk/setting/Buttons";

export function LoginNextcloudBottomSheet(ctx, onCancel) {
  const state = new StateManager(ctx, "login_nextcloud");
  const [url, setUrl] = state.useSetting("nextcloud_url_validate", "");
  const [urlValid, setUrlValid] = state.useSetting("nextcloud_url_valid", false);

  let urlCheckStatus = "Checking, is URL valid…";
  switch(urlValid) {
    case true:
      urlCheckStatus = "Nextcloud URL is valid.";
      break;
    case false:
      urlCheckStatus = "Enter valid cloud URL to continue.";
      break;
  }

  return BottomSheet(true, onCancel, [
    TextRoot([
      Paragraph([
        t("Additional server configuration is required, to use this feature. Check this before login: "),
        Link("https://github.com/melianmiko/ZeppOS-Tasks/wiki/Nextcloud-server-configuration"),
      ], {
        backgroundColor: "#EEEEEE",
        fontSize: "0.9em",
        borderRadius: "8px",
        padding: "8px",
      }),
      Paragraph([
        t("Enter your Nextcloud installation URL:"),
      ]),
    ]),
    Input("Server URL", url, (v) => {
      setUrlValid("sus");
      setUrl(v);
    }),
    TextRoot([
      Paragraph([t(urlCheckStatus)], {
        opacity: ".75",
        fontSize: ".7em",
      })
    ]),
    ...(urlValid === true ? NextcloudCredentialsForm(ctx, url) : []),
  ])
}

function NextcloudCredentialsForm(ctx, url) {
  const state = new StateManager(ctx, "nextcloud_credentials");
  const [login, setLogin] = state.useState("");
  const [password, setPassword] = state.useState("");
  const [_, setTestConfig] = state.useSetting("caldav_validate", "");
  const [testResult, setTestResult] = state.useSetting("caldav_validate_result", false);

  function startValidationIfPossible(login, password) {
    if(login === "" || password === "")
      return setTestResult(false);

    setTestResult("sus");
    setTestConfig({host: url, user: login, password: password});
  }

  let credCheckStatus = "Checking, is login/password valid…";
  switch(testResult) {
    case true:
      credCheckStatus = "Credentials are valid, connection success.";
      break;
    case false:
      credCheckStatus = "Authorization failed, or server configuration isn't valid.";
      break;
  }

  return [
    TextRoot([
      Paragraph(t("Enter your cloud credentials. If two-factor auth is enabled, you must " +
        "create and use an application password.")),
    ]),
    Input(t("Username"), login, (v) => {
      setLogin(v);
      startValidationIfPossible(v, password);
    }),
    Input(t("Password"), password , (v) => {
      setPassword(v);
      startValidationIfPossible(login, v);
    }),
    TextRoot([
      Paragraph([t(credCheckStatus)], {
        opacity: ".75",
        fontSize: ".7em",
      }),
      testResult === true ? PrimaryButton(t("Save configuration"), () => {
        ctx.settingsStorage.setItem("auth_token", JSON.stringify({
          host: url,
          user: login,
          password: password
        }));
      }) : null,
    ]),
  ]
}
