import { BaseAboutScreen } from "../../lib/mmk/BaseAboutScreen";
import {VERSION} from "../../version";

const { t } = getApp()._options.globalData

export class AboutScreen extends BaseAboutScreen {
  constructor(p) {
    super();

    const params = JSON.parse(p);

    this.appId = 1023438;
    this.appName = "Tasks";
    this.version = VERSION;
    this.donateUrl = `page/${params.pageClass}/DonatePage`;
    this.donateText = t("Donate");

    this.iconSize = 100;
    this.iconFile = "icon_about.png";

    this.infoRows = [
      ["melianmiko", "Developer"],
    ];

    this.uninstallText = t("Uninstall");
    this.uninstallConfirm = t("Tap again to confirm");
    this.uninstallResult = t("Uninstall complete");
  }
}
