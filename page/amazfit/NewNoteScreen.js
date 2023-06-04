import { NewNoteScreen } from "../common/NewNoteScreen";

Page({
  onInit(params) {
    hmUI.setStatusBarVisible(false);
    new NewNoteScreen(params).build();
  }
})
