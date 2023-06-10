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
    this.headline(t('section_lists'));
    this.lists.forEach(({ id, title }) => this.row({
      text: title,
      icon: "icon_s/list.png",
      callback: () => this.applyList(id)
    }));
    if(this.mode === "setup") return;

    // UI settings
    this.headline(t("section_settings_ui"));
    this.row({
      text: t("setup_font_size"),
      icon: "icon_s/font_size.png",
      callback: () => hmApp.gotoPage({
        url: `page/${this.pageClass}/FontSizeSetupScreen`
      })
    });
    this.row({
      text: t("setup_keyboard"),
      icon: "icon_s/keyboard.png",
      callback: () => hmApp.gotoPage({
        url: `page/${this.pageClass}/ScreenBoardSetup`
      })
    });
    this.row({
      text: t("setup_with_complete"),
      icon:  `icon_s/cb_${config.get("withComplete", false)}.png`,
      callback: () => {
        config.set("withComplete", !config.get("withComplete", false));
        hmApp.goBack();
      }
    })

    // Advanced settings
    this.headline(t("section_advanced"));
    if(this.mode === "offline") this.row({
      text: t("remove_complete"),
      icon: "icon_s/cleanup.png",
      callback: () => this.offlineRemoveComplete()
    })
    this.row({
      text: t("wipe_app_data"),
      icon: "icon_s/wipe_all.png",
      callback: () => this.wipeEverything()
    });
    if(this.mode !== "offline") this.text({
      text: t("option_above_didnt_clear_cloud"),
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
      return hmUI.showToast({text: t("tap_to_confirm")});
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
      text: t("about_this_app"),
      icon: "icon_s/about.png",
      callback: () => hmApp.gotoPage({
        url: `page/${this.pageClass}/AboutScreen`,
        param: JSON.stringify({
          pageClass: this.pageClass,
        })
      })
    });
    this.row({
      text: t("help_index"),
      icon: "icon_s/help.png",
      callback: () => hmApp.gotoPage({
        url: `page/${this.pageClass}/MarkdownReader`,
        param: "index.txt"
      })
    });
  }
}
