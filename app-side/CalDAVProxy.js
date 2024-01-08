import {pjXML} from "../lib/pjxml";

const PAYLOAD_GET_CALENDARS = "<x0:propfind xmlns:x0=\"DAV:\"><x0:prop><x0:displayname /><x1:supported-calendar-component-set xmlns:x1=\"urn:ietf:params:xml:ns:caldav\" /></x0:prop></x0:propfind>\n";

export class CalDAVProxy {
  constructor() {
    this.onConfigAvailable();
  }

  async handleRequest(ctx, request) {
    if(request.package !== "caldav_proxy") return;

    let response = {error: "unknown action"};
    switch(request.action) {
      case "get_task_lists":
        response = await this.getTaskLists();
        break;
    }

    ctx.response({data: response});
  }

  async request(method, path, body=undefined, headers={}) {
    return fetch({
      method: method === "GET" ? method : "POST",
      url: `${this.config.host}${path}`,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Authorization": this.authHeader,
        "X-Http-Method": method,
        ...headers,
      },
      body,
    });
  }


  async getTaskLists() {
    if(!this.config.host)
      return {error: "Config not loaded"};
    if(!this.authHeader)
      return {error: "No auth header (wtf)"};

    const resp = await this.request("PROPFIND",
      `/calendars/${this.config.user}/`,
      PAYLOAD_GET_CALENDARS,
      {
        "Depth": "1",
      });

    if(resp.status >= 300)
      return {error: `Can't list calendars/TODO-lists, ${resp.status}`};
    if(typeof resp.body !== "string")
      return {error: "Zepp version didn't compatible"};

    const xml = pjXML.parse(resp.body);
    const output = [];
    for(const node of xml.selectAll("//d:response")) {
      const type = node.select("//cal:comp");
      if(!type.attributes || type.attributes.name !== "VTODO") continue;

      const id = node.select("//d:href").content[0];
      const title = node.select("//d:displayname").content[0];
      output.push({id, title});
    }

    return output;
  }

  onConfigAvailable() {
    try {
      this.config = JSON.parse(settings.settingsStorage.getItem("access_token"));
      if(this.config.host.endsWith("/"))
        this.config.host = this.config.host.substring(0, this.config.host.length -1);
      this.authHeader = "Basic " + btoa(`${this.config.user}:${this.config.password}`);
      console.log("Load CalDAV config", this.config);
    } catch(e) {
      console.log("Can't read config", e)
      this.config = {};
    }
  }
}