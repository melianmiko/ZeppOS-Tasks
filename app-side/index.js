import {ZeppTasksSideService} from "./Service";

AppSideService({
  onInit() {
    console.log(1);
    new ZeppTasksSideService().init();
  },

  onRun() {
  },

  onDestroy() {
  }
})
