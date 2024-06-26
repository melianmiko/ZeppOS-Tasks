import {gettext as t} from "i18n";
import {BottomSheet} from "../../lib/mmk/setting/BottomSheet";
import {TextRoot} from "../../lib/mmk/setting/Layout";
import {Link, Paragraph, Title} from "../../lib/mmk/setting/Typography";

export function LoginAutoBottomSheet(ctx, onCancel) {
  return BottomSheet(true, onCancel, [
    View({
      style: {
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "center",
        maxWidth: "80vw",
        margin: "auto",
      }
    }, [
      Title(t("Set up sync"), {
        textAlign: "center"
      }),
      Paragraph([
        t("Copy the following link, open them into your browser, and perform a log in.")
      ]),
      Paragraph([
        ctx.settingsStorage.getItem("login_url"),
      ], {
        overflowX: "auto",
        backgroundColor: "rgba(0,0,0,0.05)",
        padding: "8px",
        margin: "16px 0",
        borderRadius: "16px",
        overflowY: "auto",
        whiteSpace: "pre",
        wordBreak: "break-all",
        userSelect: "all",
      })
    ])
  ]);
}