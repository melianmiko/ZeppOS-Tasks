import {handleFetchRequest} from "../lib/mmk/FetchForward";
import {MessageBuilder} from "../lib/zeppos/message";
import {LoginProvider} from "./login/LoginProvider";
import {CalDAVProxy} from "./CalDAVProxy";

const messageBuilder = new MessageBuilder();

export class ZeppTasksSideService {
  init() {
    this.login = new LoginProvider();
    this.caldavProxy = new CalDAVProxy();

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
        if(e.newValue === "\"login_started\"")
          await this.login.settingsBeginLogin();
        break;
      case "nextcloud_url_validate":
        await this.caldavProxy.validateNextcloudURL(JSON.parse(e.newValue));
        break;
      case "caldav_validate":
        await this.caldavProxy.validateConfig(JSON.parse(e.newValue));
        break;
      case "auth_token":
        await this.login.settingsProcessAuthToken(e.newValue);
        this.caldavProxy.onConfigAvailable();
        break;
    }
  }

  async handleRequest(ctx, request) {
    handleFetchRequest(ctx, request);
    await this.caldavProxy.handleRequest(ctx, request);

    if(request.package !== "tasks_login") return;
    switch(request.action) {
      case "notify_offline":
        settings.settingsStorage.setItem("is_forever_offline", request.value.toString());
        return ctx.response({data: {}});
      case "get_data":
        return ctx.response({
          data: await this.login.appGetAuthData(request),
        });
    }
  }
}
