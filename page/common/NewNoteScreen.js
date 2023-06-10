import { ScreenBoard } from "../../lib/mmk/ScreenBoard";

import { request, createSpinner } from "../Utils";
import { ConfiguredListScreen } from "./ConfiguredListScreen";

const { config, t } = getApp()._options.globalData

export class NewNoteScreen extends ConfiguredListScreen {
  constructor(params) {
    super();

    this.params = JSON.parse(params);
    this.board = new ScreenBoard();
    this.board.title = t("New note:");
    this.board.confirmButtonText = t("Create");
    this.board.onConfirm = (v) => this.doCreateTask(v);
  }

  build() {
    this.board.visible = true;
  }

  doCreateTask(text) {
    this.board.visible = false;

    const rqData = {
      action: "new_task",
      list: this.params.list,
      text
    };

    if(this.params.mode === "offline") {
      // No sync
      let storage = config.get("tasks", []);
      storage.unshift({
        id: storage.length,
        title: text,
        completed: false
      });
      config.set("offline", storage);
      hmApp.goBack();
    } else if(this.params.mode === "cached") {
      // Add pending request
      const queue = config.get("request_queue", []);
      queue.push(rqData)

      const lastTasks = config.get("last_tasks");
      lastTasks.items = [
          {
            id: lastTasks.items.length,
            title: text,
            completed: false
          },
          ...lastTasks.items,
      ];

      config.update({
        request_queue: queue,
        last_tasks: lastTasks
      });
      hmApp.goBack()
    } else {
      // Send now
      createSpinner();
      request(rqData).then(() => hmApp.goBack());
    }
  }
}
