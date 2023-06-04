import { ScreenBoardSetup } from "../../lib/mmk/ScreenBoardSetup";

Page({
  onInit() {
    new ScreenBoardSetup().start();
  }
})
