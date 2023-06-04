import { BaseAboutScreen } from "../../lib/mmk/BaseAboutScreen";

const { t } = getApp()._options.globalData

export class AboutScreen extends BaseAboutScreen {
  constructor(p) {
    super();

    const params = JSON.parse(p);

    this.appId = 1023438;
    this.appName = "Tasks";
    this.version = "v1.1";
    this.donateUrl = `page/${params.pageClass}/DonatePage`;

    this.infoRows = [
      ["melianmiko", "Developer"],
    ];

    this.uninstallText = t("action_uninstall");
    this.uninstallConfirm = t("tap_to_confirm");
    this.uninstallResult = t("uninstall_complete");
  }
}
