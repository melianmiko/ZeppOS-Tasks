import {ScreenBoard} from "../../lib/mmk/ScreenBoard";

import {createSpinner} from "../Utils";
import {ConfiguredListScreen} from "../ConfiguredListScreen";

const { t, tasksProvider } = getApp()._options.globalData

class NewNoteScreen extends ConfiguredListScreen {
  constructor(params) {
    super();
    console.log(params);

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

    createSpinner();
    console.log(JSON.stringify(tasksProvider));
    const list = tasksProvider.getTaskList(this.params.list);
    list.insertTask(text).then(() => {
      hmApp.goBack();
    })
  }
}

// noinspection JSCheckFunctionSignatures
Page({
  onInit(params) {
    hmUI.setStatusBarVisible(false);
    new NewNoteScreen(params).build();
  }
})
