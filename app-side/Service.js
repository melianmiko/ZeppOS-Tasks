import {MessageBuilder} from "../lib/zeppos/message";
import {GoogleTasksManager} from "./GoogleTasksManager";
import {GoogleAuth} from "./GoogleAuth";

const messageBuilder = new MessageBuilder();

export class ZeppTasksSideService {
  init() {
    // Authorizer
    this.auth = new GoogleAuth();
    this.tasks = new GoogleTasksManager(null);

    this.keepOffline = settings.settingsStorage.getItem("debug_offline") === "true";

    // Auth required?
    // noinspection JSIgnoredPromiseFromCall
    this.onLoginResponse(settings.settingsStorage.getItem("auth_token"));

    // Load token and bind renew handler
    const accessToken = settings.settingsStorage.getItem("access_token");
    if(!accessToken) {
      settings.settingsStorage.setItem("login_status", "logged_out");
    }
    this.tasks.token = accessToken;
    this.tasks.onTokenRenew = () => this.renewToken();

    // Watch for settings change
    settings.settingsStorage.addListener("change", (e) => {
      this.handleSettingsChange(e);
    });

    // MessageBuilder setup
    messageBuilder.listen(() => {});
    messageBuilder.on("request", (ctx) => {
      if(this.keepOffline) return;
      const request = messageBuilder.buf2Json(ctx.request.payload);
      return this.handleRequest(ctx, request);
    });
  }

  async onLoginRequest() {
    const storage = settings.settingsStorage;
    const [url, needRespond] = await this.auth.onLoginRequest((data) => {
      // For auto handle
      // console.log("Login response", data);
      if(data === null) return settings.settingsStorage.setItem("login_status", "logged_out");
      this.onLoginResponse(data)
    });

    storage.setItem("login_url", url);
    storage.setItem("login_status", needRespond ? 'login_form_resp' : 'login_form');
  }

  async onLoginResponse(data) {
    const storage = settings.settingsStorage;
    if(data === "") return;

    // Set status
    storage.setItem("login_status", `logging_in`);
    storage.setItem("auth_token", "");

    // Perform login
    const [access_token, refresh_token] = await this.auth.onLoginResponse(data);
    storage.setItem("access_token", access_token);
    storage.setItem("refresh_token", refresh_token);
    storage.setItem("login_status", `logged_in`);
    this.tasks.token = access_token;
  }

  async renewToken() {
    const refreshToken = settings.settingsStorage.getItem("refresh_token");
    const newToken = await this.auth.renewToken(refreshToken);

    settings.settingsStorage.setItem("access_token", newToken);
    return newToken;
  }

  async handleSettingsChange(e) {
    try {
      await this.doHandleSettingsChange(e);
    } catch(err) {
      settings.settingsStorage.setItem("last_error", err.message);
      console.error("When handling settings change", err);
    }
  }

  async doHandleSettingsChange(e) {
    switch(e.key) {
      case "access_token":
        this.tasks.token = e.newValue;
        break;
      case "debug_offline":
        this.keepOffline = e.newValue === "true";
        break;
      case "auth_token":
        await this.onLoginResponse(e.newValue);
        break;
      case "login_status":
        if(e.newValue === "login_started")
          // noinspection JSIgnoredPromiseFromCall
          await this.onLoginRequest(e.newValue);
        break;
    }
  }

  async handleRequest(ctx, request) {
    try {
      await this.doRequest(ctx, request);
    } catch(e) {
      console.error("On request handle", e);
      ctx.response({
        data: { error: String(e) }
      })
    }
  }

  async doRequest(ctx, request) {
    let data = null;

    if(!this.tasks.token) {
      ctx.response({
        data: {error: "login_first"}
      });
      return;
    }

    console.log(request);

    switch(request.action) {
      case "hello":
        data = await this.handleHello(request);
        break;
      case "set_completed":
        data = await this.tasks.setComplete(request.list, request.task, request.value);
        break;
      case "get_tasks":
        data = await this.tasks.getTasksIn(request.list, request.withComplete, request.page);
        break;
      case "new_task":
        data = await this.tasks.insertTask(request.list, request.text);
        break;
      default:
        data = {error: "Unknown action"};
    }

    if(ctx !== null) 
      return ctx.response({ data })
    return data;
  }

  async handleHello(request) {
    // Pending requests
    for(const pendingRequest of request.request_queue) {
      try {
        await this.handleRequest(null, pendingRequest);
      } catch(e) {
        console.error("Pending request failed", e);
      }
    }

    // Store deviceName for later use
    settings.settingsStorage.setItem("deviceName", request.deviceName);

    // Fetch tasks
    return {
      taskLists: await this.tasks.getTaskLists()
    };
  }
}
