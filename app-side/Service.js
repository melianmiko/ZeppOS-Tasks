import {handleFetchRequest} from "../lib/mmk/FetchForward";
import {MessageBuilder} from "../lib/zeppos/message";
import {LoginProvider} from "./login/LoginProvider";

const messageBuilder = new MessageBuilder();

export class ZeppTasksSideService {
  init() {
    this.login = new LoginProvider();

    settings.settingsStorage.addListener("change", async (e) => {
      await this.handleSettingsChange(e);
    });

    messageBuilder.listen(() => {});
    messageBuilder.on("request", (ctx) => {
      if(settings.settingsStorage.getItem("force_offline") === "true") {
        return ctx.response({
          data: {error: "offline"}
        })
      }
      const request = messageBuilder.buf2Json(ctx.request.payload);
      return this.handleRequest(ctx, request);
    });
  }

  async handleSettingsChange(e) {
    switch (e.key) {
      case "login_status":
        if(e.newValue === "login_started")
          await this.login.settingsBeginLogin();
        break;
      case "auth_token":
        await this.login.settingsProcessAuthToken(e.newValue);
        break;
    }
  }

  async handleRequest(ctx, request) {
    handleFetchRequest(ctx, request);

    if(request.package !== "tasks_login") return;
    ctx.response({
      data: await this.login.appGetAuthData(),
    })
  }
}
