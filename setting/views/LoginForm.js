import { gettext } from "i18n";
import { HEADER_VIEW } from "../styles";

export function LoginForm(props, withResponse) {
  let responseView = withResponse ? LoginResponseView() : StepGuide(3, gettext("Wait for a few seconds until app will connect with Google and validate your credentials"));

  return View({}, [
    View(HEADER_VIEW, [
      Text({
        style: {
          flex: 1
        },
        bold: true
      }, gettext("How-to login:")),
      Button({
        label: gettext("Cancel"),
        style: {
          width: "50%",
          boxShadow: "none"
        },
        onClick: () => {
          props.settingsStorage.setItem("login_status", "logged_out");
        }
      })
    ]),
    View({}, [
      // Text({bold: true}, ),
      StepGuide(1, gettext("Copy the following link, open them into your browser, and perform a log in.")),
      Text({
        style: {
          userSelect: "text",
          display: "block",
          background: "#ddd",
          marginTop: "8px",
          padding: "8px",
          borderRadius: "8px",
          fontSize: "12px",
          overflowY: "auto",
          wordBreak: "break-all"
        }
      }, props.settingsStorage.getItem("login_url")),
    ]),
    responseView
  ]);
}

function LoginResponseView() {
  return View({
    style: {
      marginTop: "16px"
    }
  }, [
    StepGuide(2, gettext("After that, you'll got a access token on screen. Paste them into field bellow:")),
    TextInput({
      settingsKey: "auth_token",
      label: "Google Auth code:",
      labelStyle: {
        color: "#555",
        marginTop: "16px",
        fontSize: "12px"
      },
      subStyle: {
        margin: "8px 0",
        color: "#000000",
        background: "#ffffff",
        fontSize: "15px",
        border: "thin #CCCCCC solid",
        borderRadius: "4px",
        height: "40px",
        overflow: "hidden",
      },
    }),
    StepGuide(3, gettext("Wait for a few seconds until app will connect with Google and validate your credentials")),
  ])
}

function StepGuide(num, text) {
  return View({
    style: {
      display: "flex",
      marginTop: "8px",
      alignItems: "start",
    }
  }, [
    Text({
      style: {
        borderRadius: "50%",
        lineHeight: "24px",
        minWidth: "24px",
        marginRight: "8px",
        textAlign: "center",
        background: "#ddd"
      },
      bold: true
    }, num),
    Text({}, text),
  ])
}
