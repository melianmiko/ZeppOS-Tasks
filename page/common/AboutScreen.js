import { BaseAboutScreen } from "../../lib/mmk/BaseAboutScreen";

const { t } = getApp()._options.globalData

export class AboutScreen extends BaseAboutScreen {
  constructor(p) {
    super();

    const params = JSON.parse(p);

    this.appId = 1023438;
    this.appName = "Tasks";
    this.version = "v1.3";
    this.donateUrl = `page/${params.pageClass}/DonatePage`;
    this.donateText = t("Donate");

    this.infoRows = [
      ["melianmiko", "Developer"],
    ];

    this.uninstallText = t("Uninstall");
    this.uninstallConfirm = t("Tap again to confirm");
    this.uninstallResult = t("Uninstall complete");
  }
}
