import { NewNoteScreen } from "../common/NewNoteScreen";
import {AppGesture} from "../../lib/mmk/AppGesture";

Page({
  onInit(params) {
    AppGesture.withYellowWorkaround("left", {
      appid: 1023438,
      url: "page/miband7/NewNoteScreen",
      param: params,
    })
    AppGesture.init();

    new NewNoteScreen(params).build();
  }
})
