import {ICON_SIZE_MEDIUM, SCREEN_MARGIN_Y, SCREEN_WIDTH} from "../../lib/mmk/UiParams";

import { createSpinner, getOfflineInfo } from "../Utils";
import { ConfiguredListScreen } from "./ConfiguredListScreen";
import { TouchEventManager } from "../../lib/mmk/TouchEventManager";

const { config, t, tasksProvider } = getApp()._options.globalData

export class HomeScreen extends ConfiguredListScreen {
  constructor(params, pageClass) {
    super();

    this.accentColor = 0x00a2b6;

    this.pageClass = pageClass;
    this.mode = "online";
    this.currentList = null;
    this.taskData = null;

    try {
      this.params = JSON.parse(params);
      if(!this.params) this.params = {};
    } catch(e) {
      this.params = {};
    }
  }

  init() {
    // Loading spinner
    this.hideSpinner = createSpinner();

    // Load task lists
    tasksProvider.init().then(() => {
      return tasksProvider.getTaskLists();
    }).then((lists) => {
      this.taskLists = lists;

      if(config.get("forever_offline")) {
        this.currentList = lists[0]
      } else {
        this.currentList = this.findCurrentList();
        if(!this.currentList) return this.openSettings("setup", true);
      }

      return this.currentList.getTasks(config.get("withComplete", false), this.params.page);
    }).then((taskData) => {
      this.taskData = taskData;

      // Build UI
      this.hideSpinner();
      this.build();
    }).catch((error) => {
      this.onInitFailure(error instanceof Error ? error.message : error);
      this.hideSpinner();
    })
  }

  /**
   * Open settings page (as new pane or replace current)
   */
  openSettings(mode, replace = false) {
    const params = {
      url: `page/${this.pageClass}/SettingsScreen`,
      param: JSON.stringify({
        lists: this.taskLists,
        fromReplace: replace,
        mode
      })
    };

    replace ? hmApp.reloadPage(params) : hmApp.gotoPage(params);
  }

  /**
   * Open new note creation UI
   */
  openNewNoteUI() {
    hmApp.gotoPage({
      url: `page/${this.pageClass}/NewNoteScreen`,
      param: JSON.stringify({
        list: this.currentList.id,
        mode: this.mode
      })
    })
  }

  /**
   * Find saved user list
   */
  findCurrentList() {
    const selectedList = config.get("cur_list_id");
    for (const entry of this.taskLists) {
      if (entry.id === selectedList) {
        return entry;
      }
    }

    return null;
  }

  /**
   * Build main UI
   */
  build() {
    // Header
    this.twoActionBar([
      this.mode === "cached" ? {
        text: this.offlineInfo,
        icon: "icon_s/mode_cached.png",
        color: 0xFF9900,
        card: {
          color: 0x0
        }
      } : {
        text: this.currentList.title,
        icon: `icon_s/mode_${this.mode}.png`,
        callback: () => this.openSettings(this.mode)
      },
      {
        text: t("New..."),
        icon: "icon_s/new.png",
        callback: () => this.openNewNoteUI()
      }
    ])

    // Tasks
    this.headline(t(this.mode === "cached" ? "Offline tasks:" : "Tasks:"));
    this.taskData.tasks.map((data) => {
      this.taskCard(data);
    });

    if(this.taskData.tasks.length === 0) {
      this.text({
        text: t("There's no incomplete tasks in that list")
      })
    }

    this.taskData.nextPageToken ? this.moreButton() : this.offset();
  }

  /**
   * UI: Show more button
   */
  moreButton() {
    const height = Math.max(64, SCREEN_MARGIN_Y);
    const view = hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: this.positionY,
      w: SCREEN_WIDTH,
      h: height,
      pos_x: Math.floor((SCREEN_WIDTH - ICON_SIZE_MEDIUM) / 2),
      pos_y: Math.floor((height - ICON_SIZE_MEDIUM) / 2),
      src: "icon_m/more.png"
    });

    new TouchEventManager(view).ontouch = () => {
      hmApp.reloadPage({
        url: `page/${this.pageClass}/HomeScreen`,
        param: JSON.stringify({
          page: this.taskData.nextPageToken
        })
      })
    };

    this.positionY += height;
  }

  /**
   * UI: Task card widget
   */
  taskCard(data) {
    let {title, completed} = data;

    if(!title) title = "";
    const row = this.row({
      text: title,
      card: {
        hiddenButton: t("Edit"),
        hiddenButtonCallback: () => {
          hmApp.gotoPage({
            url: `page/${this.pageClass}/TaskEditScreen`,
            param: JSON.stringify({
              list_id: this.currentList.id,
              task_id: data.id,
              mode: this.mode
            })
          })
        }
      },
      callback: () => {
        completed = !completed;
        updateComplete();
        data.setCompleted(completed);
      }
    });

    const updateComplete = () => {
      row.textView.setProperty(hmUI.prop.COLOR, completed ? 0x999999 : 0xFFFFFF);
      row.iconView.setProperty(hmUI.prop.SRC, completed ? 'icon_s/cb_true.png' : 'icon_s/cb_false.png');
    }

    updateComplete();
  }

  /**
   * This function will handle init error
   */
  onInitFailure(message) {
    console.log(message);

    if(config.get("last_tasks", null) != null) {
      return this.buildCached(message);
    }

    // Show error and option to work without sync
    this.row({
      text: getOfflineInfo(message),
      color: 0xFF9900,
      icon: "icon_s/mode_cached.png",
      card: {
        color: 0x0
      }
    });

    this.row({
      text: t("How-to login?"),
      icon: "icon_s/help.png",
      callback: () => {
        hmApp.gotoPage({
          url: `page/${this.pageClass}/MarkdownReader`,
          param: "help_google.md"
        })
      }
    });
    this.row({
      text: t("Use application without sync"),
      icon: "icon_s/mode_offline.png",
      callback: () => {
        config.update({
          forever_offline: true,
          tasks: [],
        });
        hmApp.reloadPage({
          url: `page/${this.pageClass}/HomeScreen`,
        })
      }
    });
  }
}
