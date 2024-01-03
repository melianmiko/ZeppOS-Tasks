import {gettext as t} from "i18n";
import {BottomSheet} from "../../lib/mmk/setting/BottomSheet";
import {TextRoot} from "../../lib/mmk/setting/Layout";
import {Link, Paragraph} from "../../lib/mmk/setting/Typography";

export function LoginWithResponseBottomSheet(ctx, onCancel) {
  return BottomSheet(true, onCancel, [
    TextRoot([
      Paragraph([
        t("Copy the following link, open them into your browser, and perform a log in.")
      ]),
      Paragraph([
        Link(ctx.settingsStorage.getItem("login_url")),
      ], {
        overflowY: "auto",
        wordBreak: "break-all"
      }),
      Paragraph([
        t("After that, you'll got a access token on screen. Paste them into field bellow:")
      ]),
    ]),
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
  ])
}