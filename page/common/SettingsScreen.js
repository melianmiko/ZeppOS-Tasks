import { ConfiguredListScreen } from "./ConfiguredListScreen";

const { config, t } = getApp()._options.globalData

export class SettingsScreen extends ConfiguredListScreen {
  constructor(params, pageClass) {
    super();

    this.accentColor = 0x00a2b6;

    params = JSON.parse(params);
    this.mode = params.mode;
    this.lists = params.lists;
    this.fromReplace = params.fromReplace;
    this.pageClass = pageClass;

    this.wipeConfirm = 3;
  }

  build() {
    if(this.mode !== "setup") this.buildHelpItems();

    // Lists picker
    this.headline(t('Task lists:'));
    this.lists.forEach(({ id, title }) => this.row({
      text: title,
      icon: "icon_s/list.png",
      callback: () => this.applyList(id)
    }));
    if(this.mode === "setup") return;

    // UI settings
    this.headline(t("User interface:"));
    this.row({
      text: t("Font size..."),
      icon: "icon_s/font_size.png",
      callback: () => hmApp.gotoPage({
        url: `page/${this.pageClass}/FontSizeSetupScreen`
      })
    });
    this.row({
      text: t("Keyboard..."),
      icon: "icon_s/keyboard.png",
      callback: () => hmApp.gotoPage({
        url: `page/${this.pageClass}/ScreenBoardSetup`
      })
    });
    this.row({
      text: t("Show complete tasks"),
      icon:  `icon_s/cb_${config.get("withComplete", false)}.png`,
      callback: () => {
        config.set("withComplete", !config.get("withComplete", false));
        hmApp.goBack();
      }
    })

    // Advanced settings
    this.headline(t("Advanced:"));
    if(this.mode === "offline") this.row({
      text: t("Remove completed tasks"),
      icon: "icon_s/cleanup.png",
      callback: () => this.offlineRemoveComplete()
    })
    this.row({
      text: t("Wipe ALL local data"),
      icon: "icon_s/wipe_all.png",
      callback: () => this.wipeEverything()
    });
    if(this.mode !== "offline") this.text({
      text: t("Option above didn't delete any data from your Google account."),
      fontSize: this.fontSize - 2,
      color: 0x999999
    });

    this.offset();
  }

  applyList(id) {
    config.set("cur_list_id", id);

    const rq = {
      url: `page/${this.pageClass}/HomeScreen`
    };

    this.fromReplace ? hmApp.reloadPage(rq) : hmApp.goBack();
  }

  wipeEverything() {
    if(this.wipeConfirm > 0) {
      this.wipeConfirm--;
      return hmUI.showToast({text: t("Tap again to confirm")});
    }

    config.wipe();
    hmApp.goBack();
  }

  offlineRemoveComplete() {
    const storage = config.get("tasks", []);
    const output = []
    for(const task of storage) {
      if(!task.completed)
        output.push(task);
    }
    config.set("tasks", output);
    hmApp.goBack();
  }

  buildHelpItems() {
    this.row({
      text: t("About..."),
      icon: "icon_s/about.png",
      callback: () => hmApp.gotoPage({
        url: `page/${this.pageClass}/AboutScreen`,
        param: JSON.stringify({
          pageClass: this.pageClass,
        })
      })
    });
    this.row({
      text: t("Help index"),
      icon: "icon_s/help.png",
      callback: () => hmApp.gotoPage({
        url: `page/${this.pageClass}/MarkdownReader`,
        param: "index.txt"
      })
    });
  }
}
