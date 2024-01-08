import {pjXML} from "../lib/pjxml";

const PAYLOAD_GET_CALENDARS = "<x0:propfind xmlns:x0=\"DAV:\"><x0:prop><x0:displayname /><x1:supported-calendar-component-set xmlns:x1=\"urn:ietf:params:xml:ns:caldav\" /></x0:prop></x0:propfind>\n";
const PAYLOAD_GET_TASKS_COMPLETED = "<x1:calendar-query xmlns:x1=\"urn:ietf:params:xml:ns:caldav\"><x0:prop xmlns:x0=\"DAV:\"><x0:getcontenttype/><x0:getetag/><x0:resourcetype/><x0:displayname/><x0:owner/><x0:resourcetype/><x0:sync-token/><x0:current-user-privilege-set/><x0:getcontenttype/><x0:getetag/><x0:resourcetype/><x1:calendar-data/></x0:prop><x1:filter><x1:comp-filter name=\"VCALENDAR\"><x1:comp-filter name=\"VTODO\"><x1:prop-filter name=\"completed\"/></x1:comp-filter></x1:comp-filter></x1:filter></x1:calendar-query>\n";
const PAYLOAD_GET_TASKS_NO_COMPLETED = "<x1:calendar-query xmlns:x1=\"urn:ietf:params:xml:ns:caldav\"><x0:prop xmlns:x0=\"DAV:\"><x0:resourcetype /><x1:calendar-data /></x0:prop><x1:filter><x1:comp-filter name=\"VCALENDAR\"><x1:comp-filter name=\"VTODO\"><x1:prop-filter name=\"completed\"><x1:is-not-defined /></x1:prop-filter></x1:comp-filter></x1:comp-filter></x1:filter></x1:calendar-query>\n";

export class CalDAVProxy {
  constructor() {
    this.onConfigAvailable();
  }

  async handleRequest(ctx, request) {
    if(request.package !== "caldav_proxy") return;

    let response = {error: "unknown action"};
    switch(request.action) {
      case "delete_task":
        response = await this.deleteTask(request.id);
        break;
      case "get_task_lists":
        response = await this.getTaskLists();
        break;
      case "read_task":
        response = await this.getTask(request.id);
        break;
      case "list_tasks":
        response = await this.listTasks(request.listId, request.completed);
        break;
      case "replace_task":
        response = await this.replaceTask(request.id, request.rawData);
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

  async getTask(id) {
    const resp = await this.request("GET", id);
    return {id, rawData: this.ics2js(resp.body)};
  }

  async deleteTask(id) {
    const resp = await this.request("DELETE", id);
    return {result: true};
  }

  async listTasks(listID, completed) {
    if(!this.config.host)
      return {error: "Config not loaded"};
    if(!this.authHeader)
      return {error: "No auth header (wtf)"};

    const resp = await this.request("REPORT",
      listID,
      completed ? PAYLOAD_GET_TASKS_COMPLETED : PAYLOAD_GET_TASKS_NO_COMPLETED,
      {
        "Depth": "1",
      });

    const basePath = this.config.host.substring(this.config.host.indexOf("/", "https://".length));

    const xml = pjXML.parse(resp.body);
    const output = [];
    for(const node of xml.selectAll("//d:response")) {
      const id = node.selectAll("//d:href")[0].content[0].substring(basePath.length);
      let rawData = node.selectAll("//cal:calendar-data");
      if(rawData.length < 1) return;
      rawData = rawData[0].content[0];
      output.push({id, rawData: this.ics2js(rawData)});
    }

    return output;
  }

  async replaceTask(id, rawData) {
    if(!this.config.host)
      return {error: "Config not loaded"};
    if(!this.authHeader)
      return {error: "No auth header (wtf)"};

    const resp = await this.request("PUT", id, this.js2ics(rawData), {
      "Depth": "0",
      "Content-Type": "text/calendar; charset=UTF-8; component=vtodo; charset=UTF-8",
    });

    return {result: true};
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

    const basePath = this.config.host.substring(this.config.host.indexOf("/", "https://".length));

    const xml = pjXML.parse(resp.body);
    const output = [];
    for(const node of xml.selectAll("//d:response")) {
      const type = node.select("//cal:comp");
      if(!type.attributes || type.attributes.name !== "VTODO") continue;

      const id = node.select("//d:href").content[0].substring(basePath.length);
      const title = node.select("//d:displayname").content[0];
      output.push({id, title});
    }

    return output;
  }

  ics2js(ics) {
    const useWin32split = ics.indexOf("\r\n") > -1;
    const lines = ics.split(useWin32split ? "\r\n" : "\n");

    let stack = [{}];
    for(const line of lines) {
      const key = line.substring(0, line.indexOf(":"));
      const value = line.substring(key.length + 1);
      if(key === "BEGIN") {
        const o = {};
        stack[stack.length - 1][value] = o
        stack.push(o);
      } else if(key === "END") {
        stack.pop();
      } else if(key !== "") {
        stack[stack.length - 1][key] = eval(`"${value}"`);
      }
    }

    return stack[0];
  }

  js2ics(obj) {
    let out = "";
    for(const key in obj) {
      if(key === "") continue;
      if(typeof obj[key] === "string") {
        out += key + ":" + this.icsEscape(obj[key]) + "\n";
      } else {
        out += "BEGIN:" + key + "\n";
        out += this.js2ics(obj[key]);
        out += "END:" + key + "\n";
      }
    }

    return out;
  }

  icsEscape(v) {
    const symbols = ["\\", ",", "\"", "\'", ","]; // to be filled
    for(const s of symbols)
      v = v.replaceAll(s, "\\" + s);
    return v;
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