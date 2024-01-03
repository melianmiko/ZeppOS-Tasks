import {TextRoot} from "../../lib/mmk/setting/Layout";
import {Paragraph} from "../../lib/mmk/setting/Typography";

export function DebugTab(ctx) {
  return TextRoot([
    Toggle({
      label: "Prevent accessing internet (force cached/offline mode)",
      settingsKey: "force_offline"
    }),
    Paragraph([
      `Reported device name: ${ctx.settingsStorage.getItem("device_name")}`
    ]),
  ]);
}
