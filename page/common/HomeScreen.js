import { 
  ICON_SIZE_MEDIUM, 
  SCREEN_MARGIN_Y, 
  SCREEN_WIDTH 
} from "../../lib/mmk/UiParams";

import { request, createSpinner, getOfflineInfo } from "../Utils";
import { ConfiguredListScreen } from "./ConfiguredListScreen";
import { TouchEventManager } from "../../lib/mmk/TouchEventManager";

const { config, t } = getApp()._options.globalData

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
    // No sync mode
    if(config.get("forever_offline", false)) {
      return this.buildOffline();
    }

    // Loading spinner
    this.hideSpinner = createSpinner();

    // Load task lists
    request({
      action: "hello",
      request_queue: config.get("request_queue", [])
    }).then((data) => {
      this.taskLists = data.taskLists;
      this.currentList = this.findCurrentList();

      // If no list selected, redirect to settings
      if(!this.currentList) return this.openSettings("setup", true);

      // Clear delivery queue (they are delivered)
      config.set("request_queue", []);

      // Fetch tasks
      const body = { 
        action: "get_tasks", 
        list: this.currentList.id,
        withComplete: config.get("withComplete", false),
      };

      if(this.params.page) body.page = this.params.page;
      return request(body);
    }).then((taskData) => {
      this.taskData = taskData;

      // Save for offline
      if(!this.params.page && this.mode === "online") {
        config.update({
          last_tasks: taskData,
          last_list: this.currentList,
        })
      }

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
   * Build in forever offline mode
   */
  buildOffline() {
    const PAGE_SIZE = 20;

    const withCompleted = config.get("withComplete", false);

    const storage = config.get("tasks", []);
    const output = [];
    const position = this.params.page ? this.params.page : 0;
    for(let i = position; i < storage.length && output.length < PAGE_SIZE; i++) {
      if(!storage[i].completed || withCompleted)
        output.push(storage[i]);
    }

    this.taskData = {
      nextPageToken: position + output.length < storage.length ? position + output.length : null,
      items: output
    };
    this.mode = "offline";
    this.taskLists = [{id: "offline", title: t("Offline")}]
    this.currentList = this.taskLists[0];

    return this.build();
  }

  /**
   * Build in temporary offline mode
   */
  buildCached(message) {
    this.mode = "cached";
    this.currentList = config.get("last_list");
    this.taskData = config.get("last_tasks");
    this.offlineInfo = getOfflineInfo(message);
    return this.build();
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
        text: t("action_new_note"),
        icon: "icon_s/new.png",
        callback: () => this.openNewNoteUI()
      }
    ])

    this.headline(t(this.mode === "cached" ? "section_tasks_offline" : "section_tasks"));
    this.taskData.items.map((data) => {
      this.taskCard(data);
    });

    if(this.taskData.items.length === 0) {
      this.text({
        text: t("no_tasks_message")
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
      callback: () => {
        completed = !completed;
        updateComplete();
        this.setTaskCompleted(data, completed);
      }
    });

    const updateComplete = () => {
      row.textView.setProperty(hmUI.prop.COLOR, completed ? 0x999999 : 0xFFFFFF);
      row.iconView.setProperty(hmUI.prop.SRC, completed ? 'icon_s/cb_true.png' : 'icon_s/cb_false.png');
    }

    updateComplete();
  }

  /**
   * Modify given task, set status to `completed` boolean
   */
  setTaskCompleted(data, completed) {
    const rq = {
      action: "set_completed",
      list: this.currentList.id,
      task: data.id,
      value: completed
    };

    if(this.mode === "offline") {
      // No sync
      data.completed = completed;
      config.save();
    } else if(this.mode === "cached") {
      // Stage request for delivering later
      const queue = config.get("request_queue", []);
      queue.push(rq);

      data.completed = completed;

      config.update({
        request_queue: queue,
        last_tasks: this.taskData
      })
    } else {
      // Send now
      request(rq);
    }
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
      text: t("how_to_log_in"),
      icon: "icon_s/help.png",
      callback: () => {
        hmApp.gotoPage({
          url: `page/${this.pageClass}/MarkdownReader`,
          param: "help_google.txt"
        })
      }
    });
    this.row({
      text: t("enable_forever_offline"),
      icon: "icon_s/mode_offline.png",
      callback: () => {
        config.update({
          forever_offline: true,
          tasks: []
        });
        hmApp.reloadPage({
          url: `page/${this.pageClass}/HomeScreen`,
        })
      }
    });
  }
}
