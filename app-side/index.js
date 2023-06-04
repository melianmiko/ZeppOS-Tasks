import {ZeppTasksSideService} from "./Service";

AppSideService({
  onInit() {
    new ZeppTasksSideService().init();
  },

  onRun() {
  },

  onDestroy() {
  }
})
